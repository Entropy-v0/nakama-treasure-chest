-- ==============================================================================
-- NAKAMA (ExLibris) — ESQUEMA COMPLETO DE BASE DE DATOS (INICIALIZACIÓN DESDE CERO)
-- ==============================================================================

-- 1. LIMPIEZA TOTAL PREVIA (¡CUIDADO: SOLO PARA INICIALIZACIÓN DE CERO!)
-- Si ya tienes datos reales en tu base de datos, NO EJECUTES ESTE ARCHIVO.
-- Usa las migraciones incrementales en supabase/migrations/
-- delete from auth.users;

drop trigger if exists on_auth_user_created on auth.users cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_crew_member(_crew_id uuid, _user_id uuid) cascade;
drop function if exists public.update_updated_at_column() cascade;

drop table if exists public.crew_invites cascade;
drop table if exists public.crew_members cascade;
drop table if exists public.items cascade;
drop table if exists public.crews cascade;
drop table if exists public.profiles cascade;

-- 2. EXTENSIONES
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 3. TABLA PROFILES
-- ==============================================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  genero text default 'femenino' check (genero in ('femenino', 'masculino')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy profiles_select_all
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id);

create policy profiles_delete_own
  on public.profiles for delete
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
  clean_username text;
  raw_avatar text;
begin
  raw_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'global_name'), ''),
    split_part(new.email, '@', 1)
  );
  clean_username := raw_username;

  raw_avatar := coalesce(
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data->>'picture'), '')
  );

  insert into public.profiles (id, username, genero, avatar_url)
  values (
    new.id,
    clean_username,
    coalesce(nullif(trim(new.raw_user_meta_data->>'genero'), ''), 'femenino'),
    raw_avatar
  )
  on conflict (id) do update set
    username = coalesce(excluded.username, profiles.username),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 4. TABLAS DE TRIPULACION
-- ==============================================================================
create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete cascade default auth.uid() not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.crew_members (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references public.crews(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('capitan', 'oficial', 'nakama')) default 'nakama',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (crew_id, user_id)
);

create table public.crew_invites (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references public.crews(id) on delete cascade not null,
  inviter_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  invitee_email text not null,
  status text not null check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_crew_members_user_id on public.crew_members(user_id);
create index idx_crew_members_crew_id on public.crew_members(crew_id);
create index idx_crew_invites_email on public.crew_invites(lower(invitee_email));

-- ==============================================================================
-- 5. TABLA ITEMS
-- ==============================================================================
create table public.items (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  crew_id uuid references public.crews(id) on delete set null,
  titulo text not null,
  tipo text not null check (tipo in ('Anime', 'Manga', 'Serie', 'Película', 'Libro')),
  estado text not null check (estado in ('Pendiente', 'Viendo', 'Completado', 'Abandonado', 'En Pausa')) default 'Pendiente',
  portada text,
  puntuacion smallint check (puntuacion >= 1 and puntuacion <= 10),
  generos text[] default '{}',
  nota text,
  anio integer,
  autor text,
  estudio text,
  dia_semana text check (dia_semana is null or dia_semana in ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
  link text,
  progreso integer default 0,
  temporada integer,
  fecha_terminado date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_items_user_id on public.items(user_id);
create index idx_items_crew_id on public.items(crew_id);
create index idx_items_tipo on public.items(tipo);
create index idx_items_estado on public.items(estado);
create index idx_items_created_at on public.items(created_at desc);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.items
  for each row execute procedure public.update_updated_at_column();

-- ==============================================================================
-- 6. FUNCION AUXILIAR SECURITY DEFINER (EVITA RECURSION RLS)
-- ==============================================================================
create or replace function public.is_crew_member(_crew_id uuid, _user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.crew_members
    where crew_id = _crew_id
      and user_id = _user_id
  );
$$;

-- ==============================================================================
-- 7. POLITICAS RLS SIN RECURSION (IDENTIFICADORES ASCII SIN COMILLAS)
-- ==============================================================================

alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.crew_invites enable row level security;
alter table public.items enable row level security;

-- CREWS
create policy crews_select_policy
  on public.crews for select
  using (auth.uid() = created_by or public.is_crew_member(id, auth.uid()));

create policy crews_insert_policy
  on public.crews for insert
  with check (auth.uid() = created_by);

create policy crews_update_policy
  on public.crews for update
  using (auth.uid() = created_by);

create policy crews_delete_policy
  on public.crews for delete
  using (auth.uid() = created_by);

-- CREW_MEMBERS
create policy crew_members_select_policy
  on public.crew_members for select
  using (user_id = auth.uid() or public.is_crew_member(crew_id, auth.uid()));

create policy crew_members_insert_policy
  on public.crew_members for insert
  with check (
    auth.uid() = user_id
    or exists (select 1 from public.crews c where c.id = crew_id and c.created_by = auth.uid())
  );

create policy crew_members_delete_policy
  on public.crew_members for delete
  using (
    user_id = auth.uid()
    or exists (select 1 from public.crews c where c.id = crew_id and c.created_by = auth.uid())
  );

-- CREW_INVITES
create policy crew_invites_select_policy
  on public.crew_invites for select
  using (inviter_id = auth.uid() or lower(invitee_email) = lower(auth.jwt() ->> 'email'));

create policy crew_invites_insert_policy
  on public.crew_invites for insert
  with check (
    auth.uid() = inviter_id
    and (
      exists (select 1 from public.crews c where c.id = crew_id and c.created_by = auth.uid())
      or public.is_crew_member(crew_id, auth.uid())
    )
  );

create policy crew_invites_update_policy
  on public.crew_invites for update
  using (lower(invitee_email) = lower(auth.jwt() ->> 'email') or inviter_id = auth.uid());

create policy crew_invites_delete_policy
  on public.crew_invites for delete
  using (inviter_id = auth.uid());

-- ITEMS
create policy items_select_policy
  on public.items for select
  using (auth.uid() = user_id or (crew_id is not null and public.is_crew_member(crew_id, auth.uid())));

create policy items_insert_policy
  on public.items for insert
  with check (auth.uid() = user_id and (crew_id is null or public.is_crew_member(crew_id, auth.uid())));

create policy items_update_policy
  on public.items for update
  using (auth.uid() = user_id or (crew_id is not null and public.is_crew_member(crew_id, auth.uid())));

create policy items_delete_policy
  on public.items for delete
  using (auth.uid() = user_id or (crew_id is not null and public.is_crew_member(crew_id, auth.uid())));

-- ==============================================================================
-- 10. FUNCION PARA ELIMINAR CUENTA DE USUARIO (AUTO-ELIMINACIÓN)
-- ==============================================================================
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid;
begin
  _user_id := auth.uid();
  if _user_id is null then
    raise exception 'No autenticado';
  end if;

  -- Al borrar de auth.users, el ON DELETE CASCADE elimina perfiles, items, tripulaciones, etc.
  delete from auth.users where id = _user_id;
end;
$$;
