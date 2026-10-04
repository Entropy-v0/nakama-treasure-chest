import { supabase, isSupabaseConfigured } from './client';
import type { Crew, CrewMember, CrewInvite, ProfileSummary } from '../../types/crew';
import { MOCK_USER_ID, MOCK_USER_EMAIL } from '../../mocks/mockUser';

// Memoria local de respaldo para desarrollo offline
let inMemoryCrew: Crew | null = null;
let inMemoryMembers: CrewMember[] = [];
let inMemoryInvites: CrewInvite[] = [];

export const crewService = {
  /**
   * Obtiene la tripulación activa del usuario autenticado y sus miembros.
   */
  async getMyCrew(): Promise<{ crew: Crew; members: CrewMember[] } | null> {
    if (!isSupabaseConfigured) {
      if (!inMemoryCrew) return null;
      return {
        crew: inMemoryCrew,
        members: [...inMemoryMembers],
      };
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) return null;

    // 1. Buscar si el usuario es miembro de alguna tripulación
    const { data: memberRows, error: memberError } = await supabase
      .from('crew_members')
      .select('crew_id, role, joined_at')
      .eq('user_id', currentUser.id)
      .limit(1);

    if (memberError || !memberRows || memberRows.length === 0) {
      return null;
    }

    const activeCrewId = memberRows[0].crew_id;

    // 2. Obtener los detalles de la tripulación
    const { data: crewData, error: crewError } = await supabase
      .from('crews')
      .select('*')
      .eq('id', activeCrewId)
      .single();

    if (crewError || !crewData) {
      return null;
    }

    // 3. Obtener todos los miembros de esa tripulación
    const { data: allMembers, error: allMembersError } = await supabase
      .from('crew_members')
      .select('id, crew_id, user_id, role, joined_at')
      .eq('crew_id', activeCrewId);

    if (allMembersError || !allMembers) {
      return {
        crew: crewData as Crew,
        members: [],
      };
    }

    // 4. Obtener perfiles de cada miembro
    const userIds = allMembers.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, genero')
      .in('id', userIds);

    const profileMap = new Map<string, ProfileSummary>();
    if (profiles) {
      profiles.forEach((p: any) => {
        profileMap.set(p.id, {
          id: p.id,
          username: p.username,
          avatar_url: p.avatar_url,
          genero: p.genero,
        });
      });
    }

    const enrichedMembers: CrewMember[] = allMembers.map(m => ({
      ...m,
      profile: profileMap.get(m.user_id) || null,
    }));

    return {
      crew: crewData as Crew,
      members: enrichedMembers,
    };
  },

  /**
   * Crea una nueva tripulación y vincula al usuario creador como Capitán.
   */
  async createCrew(name: string): Promise<{ crew: Crew; members: CrewMember[] }> {
    if (!isSupabaseConfigured) {
      const mockCrew: Crew = {
        id: 'mock-crew-1',
        name,
        created_by: MOCK_USER_ID,
        created_at: new Date().toISOString(),
      };
      const mockMember: CrewMember = {
        id: 'mock-member-1',
        crew_id: mockCrew.id,
        user_id: MOCK_USER_ID,
        role: 'capitan',
        joined_at: new Date().toISOString(),
        profile: {
          id: MOCK_USER_ID,
          username: 'Capitán Nakama',
          avatar_url: null,
          genero: 'masculino',
        },
      };
      inMemoryCrew = mockCrew;
      inMemoryMembers = [mockMember];
      return { crew: mockCrew, members: inMemoryMembers };
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) throw new Error('Usuario no autenticado');

    // 1. Insertar la tripulación
    const { data: crewData, error: crewError } = await supabase
      .from('crews')
      .insert({
        name,
        created_by: currentUser.id,
      })
      .select()
      .single();

    if (crewError || !crewData) {
      throw new Error(`Error al crear la tripulación: ${crewError?.message}`);
    }

    // 2. Insertar al creador como miembro Capitán
    const { data: memberData, error: memberError } = await supabase
      .from('crew_members')
      .insert({
        crew_id: crewData.id,
        user_id: currentUser.id,
        role: 'capitan',
      })
      .select()
      .single();

    if (memberError) {
      throw new Error(`Error al unirse a la tripulación: ${memberError.message}`);
    }

    const myCrew = await this.getMyCrew();
    return myCrew || { crew: crewData as Crew, members: [memberData as CrewMember] };
  },

  /**
   * Envía una invitación para unirse a la tripulación por correo electrónico.
   */
  async sendInvite(crewId: string, email: string): Promise<CrewInvite> {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      const mockInvite: CrewInvite = {
        id: 'mock-invite-' + Date.now(),
        crew_id: crewId,
        inviter_id: MOCK_USER_ID,
        invitee_email: cleanEmail,
        status: 'pending',
        created_at: new Date().toISOString(),
        crew: inMemoryCrew,
        inviter_profile: {
          id: MOCK_USER_ID,
          username: 'Capitán Nakama',
          avatar_url: null,
          genero: 'masculino',
        },
      };
      inMemoryInvites.push(mockInvite);
      return mockInvite;
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('crew_invites')
      .insert({
        crew_id: crewId,
        inviter_id: currentUser.id,
        invitee_email: cleanEmail,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al enviar invitación: ${error.message}`);
    }

    return data as CrewInvite;
  },

  /**
   * Obtiene las invitaciones pendientes dirigidas al correo del usuario actual.
   */
  async getPendingInvites(): Promise<CrewInvite[]> {
    if (!isSupabaseConfigured) {
      let currentEmail = MOCK_USER_EMAIL;
      let currentUserId = MOCK_USER_ID;
      try {
        const stored = localStorage.getItem('nakama_mock_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) currentEmail = parsed.email.toLowerCase();
          if (parsed.id) currentUserId = parsed.id;
        }
      } catch {
        // fallback
      }

      return inMemoryInvites.filter(
        i => i.status === 'pending' &&
        i.invitee_email.toLowerCase() === currentEmail &&
        i.inviter_id !== currentUserId
      );
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser?.email) return [];

    const userEmail = currentUser.email.trim().toLowerCase();

    // 1. Obtener invitaciones donde invitee_email coincida con el correo del usuario
    const { data: rawInvites, error: invitesError } = await supabase
      .from('crew_invites')
      .select('*')
      .eq('status', 'pending')
      .ilike('invitee_email', userEmail);

    if (invitesError) {
      console.error('Error al obtener invitaciones pendientes de crew_invites:', invitesError);
      return [];
    }

    if (!rawInvites || rawInvites.length === 0) {
      return [];
    }

    // 2. Obtener datos de las tripulaciones vinculadas
    const crewIds = [...new Set(rawInvites.map((i: any) => i.crew_id))];
    const { data: crewsData, error: crewsError } = await supabase
      .from('crews')
      .select('id, name, created_by, created_at')
      .in('id', crewIds);

    if (crewsError) {
      console.warn('Error al obtener detalles de las tripulaciones para las invitaciones:', crewsError);
    }

    const crewMap = new Map<string, any>();
    if (crewsData) {
      crewsData.forEach((c: any) => crewMap.set(c.id, c));
    }

    // 3. Obtener perfiles de los usuarios invitadores
    const inviterIds = [...new Set(rawInvites.map((i: any) => i.inviter_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, genero')
      .in('id', inviterIds);

    if (profilesError) {
      console.warn('Error al obtener perfiles de invitadores:', profilesError);
    }

    const profileMap = new Map<string, ProfileSummary>();
    if (profiles) {
      profiles.forEach((p: any) => profileMap.set(p.id, p));
    }

    return rawInvites.map((item: any) => ({
      id: item.id,
      crew_id: item.crew_id,
      inviter_id: item.inviter_id,
      invitee_email: item.invitee_email,
      status: item.status,
      created_at: item.created_at,
      crew: crewMap.get(item.crew_id) || null,
      inviter_profile: profileMap.get(item.inviter_id) || null,
    }));
  },

  /**
   * Acepta una invitación a la tripulación.
   */
  async acceptInvite(inviteId: string, crewId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const invite = inMemoryInvites.find(i => i.id === inviteId);
      if (invite) {
        invite.status = 'accepted';
        let currentUserId = MOCK_USER_ID;
        let currentUsername = 'Capitán Nakama';
        try {
          const stored = localStorage.getItem('nakama_mock_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.id) currentUserId = parsed.id;
            if (parsed.user_metadata?.username) currentUsername = parsed.user_metadata.username;
          }
        } catch {
          // fallback
        }

        const newMember: CrewMember = {
          id: 'mock-member-' + Date.now(),
          crew_id: crewId,
          user_id: currentUserId,
          role: 'nakama',
          joined_at: new Date().toISOString(),
          profile: {
            id: currentUserId,
            username: currentUsername,
            avatar_url: null,
            genero: 'masculino',
          },
        };
        if (!inMemoryMembers.some(m => m.user_id === currentUserId)) {
          inMemoryMembers.push(newMember);
        }
      }
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) throw new Error('Usuario no autenticado');

    // 1. Insertar al usuario en crew_members
    const { error: memberError } = await supabase
      .from('crew_members')
      .insert({
        crew_id: crewId,
        user_id: currentUser.id,
        role: 'nakama',
      });

    if (memberError && !memberError.message.includes('duplicate key')) {
      throw new Error(`Error al unirse a la tripulación: ${memberError.message}`);
    }

    // 2. Marcar invitación como aceptada
    await supabase
      .from('crew_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId);
  },

  /**
   * Rechaza una invitación a la tripulación.
   */
  async declineInvite(inviteId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const invite = inMemoryInvites.find(i => i.id === inviteId);
      if (invite) invite.status = 'declined';
      return;
    }

    const { error } = await supabase
      .from('crew_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    if (error) {
      throw new Error(`Error al rechazar invitación: ${error.message}`);
    }
  },

  /**
   * Permite al usuario salir de su tripulación actual.
   */
  async leaveCrew(crewId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      inMemoryCrew = null;
      inMemoryMembers = [];
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) return;

    const { error } = await supabase
      .from('crew_members')
      .delete()
      .eq('crew_id', crewId)
      .eq('user_id', currentUser.id);

    if (error) {
      throw new Error(`Error al abandonar la tripulación: ${error.message}`);
    }
  },

  /**
   * Actualiza el nombre de la tripulación.
   */
  async updateCrewName(crewId: string, name: string): Promise<Crew> {
    const cleanName = name.trim();
    if (!cleanName) throw new Error('El nombre de la tripulación no puede estar vacío');

    if (!isSupabaseConfigured) {
      if (inMemoryCrew && inMemoryCrew.id === crewId) {
        inMemoryCrew.name = cleanName;
        return inMemoryCrew;
      }
      throw new Error('Tripulación no encontrada');
    }

    const { data, error } = await supabase
      .from('crews')
      .update({ name: cleanName })
      .eq('id', crewId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error al actualizar el nombre de la tripulación: ${error?.message}`);
    }

    return data as Crew;
  },

  /**
   * Obtiene las invitaciones enviadas para una tripulación que sigan pendientes.
   */
  async getSentInvites(crewId: string): Promise<CrewInvite[]> {
    if (!isSupabaseConfigured) {
      return inMemoryInvites.filter(i => i.crew_id === crewId && i.status === 'pending');
    }

    const { data, error } = await supabase
      .from('crew_invites')
      .select('*')
      .eq('crew_id', crewId)
      .eq('status', 'pending');

    if (error || !data) {
      return [];
    }

    return data as CrewInvite[];
  },

  /**
   * Cancela una invitación enviada.
   */
  async cancelInvite(inviteId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      inMemoryInvites = inMemoryInvites.filter(i => i.id !== inviteId);
      return;
    }

    const { error } = await supabase
      .from('crew_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
      throw new Error(`Error al cancelar la invitación: ${error.message}`);
    }
  },

  /**
   * Elimina o disuelve permanentemente una tripulación (solo por el capitán/creador)
   */
  async deleteCrew(crewId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      inMemoryCrew = null;
      inMemoryMembers = [];
      inMemoryInvites = [];
      return;
    }

    const { error } = await supabase
      .from('crews')
      .delete()
      .eq('id', crewId);

    if (error) {
      throw new Error(`Error al eliminar la tripulación: ${error.message}`);
    }
  },
};
