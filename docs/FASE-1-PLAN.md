# 📋 CHECKPOINT DE EJECUCIÓN: FASE 1 — SISTEMA SOCIAL DE TRIPULACIÓN ("DÚO NAKAMA")

> **Propósito:** Este documento desglosa la **Fase 1** en sub-fases atómicas y progresivas, diseñadas para que un Agente IA las ejecute de manera secuencial siguiendo las reglas de `docs/00-AGENT-RULES.md` (cero regresión, contratos estrictos y sin deuda técnica).

---

## 🎯 Meta de la Fase 1
Permitir que dos usuarios (el Capitán y la Capitana) se vinculen como una **Tripulación Compartida** mediante un sistema de invitaciones por correo/usuario, puedan decidir qué obras ver juntos o por separado, tengan un selector "¿Qué vemos hoy?", autocompleten portadas con APIs gratuitas y tengan la aplicación lista para desplegar en **Vercel**.

---

## 📊 Matriz de Sub-fases

```
[1.1 Base de Datos & RLS] ──► [1.2 Tipos & Servicios] ──► [1.3 Store & Estado]
                                                                  │
[1.6 Autocompletado APIs] ◄── [1.5 UI Dashboard]      ◄── [1.4 UI Invitaciones]
           │
           ▼
[1.7 Despliegue en Vercel]
```

---

### 🔹 Sub-fase 1.1: Base de Datos & Políticas RLS (PostgreSQL)
- [x] **1.1.1** Crear script SQL de migración (`supabase/migrations/01_crews_system.sql`):
  - Tabla `public.crews` (`id UUID PRIMARY KEY`, `name TEXT NOT NULL`, `created_by UUID REFERENCES auth.users`, `created_at TIMESTAMPTZ DEFAULT now()`).
  - Tabla `public.crew_members` (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `crew_id UUID REFERENCES public.crews ON DELETE CASCADE`, `user_id UUID REFERENCES auth.users ON DELETE CASCADE`, `role TEXT CHECK (role IN ('capitan', 'oficial', 'nakama'))`, `joined_at TIMESTAMPTZ DEFAULT now()`, `UNIQUE(crew_id, user_id)`).
  - Tabla `public.crew_invites` (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `crew_id UUID REFERENCES public.crews ON DELETE CASCADE`, `inviter_id UUID REFERENCES auth.users ON DELETE CASCADE`, `invitee_email TEXT NOT NULL`, `status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending'`, `created_at TIMESTAMPTZ DEFAULT now()`).
- [x] **1.1.2** Alterar tabla `public.items`:
  - Agregar columna `crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE NULL`.
- [x] **1.1.3** Actualizar Row Level Security (RLS) en `items`:
  - Permitir lectura (`SELECT`): `auth.uid() = user_id OR crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())`.
  - Permitir escritura/edición (`UPDATE`, `DELETE`): Creador del item o miembros de la misma tripulación.
- [x] **1.1.4** Crear políticas RLS para `crews`, `crew_members` y `crew_invites`.

---

### 🔹 Sub-fase 1.2: Tipos TypeScript y Capa de Servicios Supabase
- [x] **1.2.1** Extender contratos en `src/types/database.ts` y `src/types/items.ts`:
  - Interfaces `Crew`, `CrewMember`, `CrewInvite` en `src/types/crew.ts`.
  - Agregar `crew_id?: string | null` a `Item`.
- [x] **1.2.2** Crear `src/services/supabase/crew.service.ts`:
  - `getMyCrew()`: Retorna la tripulación actual del usuario y la lista de miembros con sus perfiles.
  - `createCrew(name: string)`: Crea una nueva tripulación y vincula al creador.
  - `sendInvite(email: string)`: Crea una invitación pendiente.
  - `getPendingInvites()`: Consulta invitaciones pendientes asociadas al correo del usuario autenticado.
  - `acceptInvite(inviteId: string)`: Registra al usuario en `crew_members` y marca la invitación como `accepted`.
  - `declineInvite(inviteId: string)`: Marca la invitación como `declined`.
  - `leaveCrew()`: Permite salir o desvincular la tripulación.
- [x] **1.2.3** Adaptar `src/services/supabase/items.service.ts`:
  - Soporte para consultar items personales vs. items de la tripulación con filtros `scope` y `crewId`.

---

### 🔹 Sub-fase 1.3: Gestión de Estado Global (Pinia & Composable)
- [x] **1.3.1** Crear store `src/stores/crew.ts`:
  - `state`: `crew`, `members`, `pendingInvites`, `loading`, `error`.
  - `getters`: `hasCrew`, `memberCount`, `isCaptain`, `partner`.
  - `actions`: `loadCrewData`, `createCrew`, `sendInvite`, `acceptInvite`, `declineInvite`, `leaveCrew`.
- [x] **1.3.2** Crear composable `src/composables/useCrew.ts` para exponer métodos reactivos desacoplados a los componentes.

---

### 🔹 Sub-fase 1.4: Interfaz de Usuario para Gestión de Tripulación e Invitaciones
- [x] **1.4.1** Crear vista y componentes de Tripulación (`src/components/crew/CrewView.vue` y `CrewModal.vue`):
  - Vista dedicada en la ruta `/crew` para gestionar la tripulación, fundarla, invitar nakamas y explorar toda la colección compartida con filtros por tipo.
- [x] **1.4.2** Añadir menú dedicado "Tripulación" en la navegación principal del `Sidebar.vue` (entre Listado y Agregar) con indicador animado si hay invitaciones pendientes. Restablecer botones de usuario en el pie a únicamente "Editar" y "Salir".

---

### 🔹 Sub-fase 1.5: UI del Dashboard — Visibilidad Compartida & Selector de Pareja
- [x] **1.5.1** Filtros en el Dashboard:
  - Selector de vista por ámbito: `[ 👥 Para ver juntos ]` | `[ 👤 Solo mío ]` | `[ 🌐 Todo ]`.
- [x] **1.5.2** Modal `AddItem.vue`:
  - Switch/Toggle: *"Compartir con mi Tripulación"* (asigna `crew_id` automáticamente).
- [x] **1.5.3** Tarjeta de Obra (`RecentItemCard` e `ItemCard`):
  - Badge visual de compartido: *"Juntos"*.
- [x] **1.5.4** Componente/Botón *"¿Qué vemos hoy?"*:
  - Sorteo aleatorio entre las obras con estado *"Pendiente"* o *"Viendo"* con modal temático animado.

---

### 🔹 Sub-fase 1.6: Autocompletado Rápido con APIs Públicas (AniList & TVMaze)
- [x] **1.6.1** Crear servicio `src/services/api/mediaSearch.service.ts`:
  - Búsqueda en API pública de AniList (GraphQL) para anime y manga.
  - Búsqueda en TVMaze API para series y películas (100% libre de tokens).
- [x] **1.6.2** Integrar barra de búsqueda con autocompletado en `AddItem.vue`:
  - Rellenado automático de portada, título, año, géneros, estudio y sinopsis con un solo clic.

---

### 🔹 Sub-fase 1.7: Despliegue en Vercel & Verificación en Vivo
- [x] **1.7.1** Archivo `vercel.json` configurado con reescritura SPA para evitar errores 404.
- [ ] **1.7.2** Ejecutar la migración SQL (`supabase/migrations/01_crews_system.sql`) en el SQL Editor de Supabase.
- [ ] **1.7.3** Conectar repositorio en Vercel y configurar variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- [ ] **1.7.4** Prueba final en vivo: el Capitán y la Capitana se vinculan a la misma tripulación y comparten sus series/películas.

---

## 🛡️ Reglas de Ejecución para el Agente IA
1. Cada sub-fase debe ejecutarse y verificarse de forma individual antes de pasar a la siguiente.
2. No introducir cambios de estilo sin usar las clases utilitarias de Tailwind v4 existentes.
3. Toda llamada a la base de datos debe residir exclusivamente en `src/services/supabase/`.
4. Mantener retrocompatibilidad con las tarjetas y vistas existentes.
