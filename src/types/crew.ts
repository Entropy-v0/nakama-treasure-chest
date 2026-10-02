/**
 * Contratos de tipos de datos para el Sistema Social de Tripulaciones ("Crews").
 * Mapeo estricto con las tablas 'crews', 'crew_members' y 'crew_invites' de PostgreSQL / Supabase.
 */

export type CrewRole = 'capitan' | 'oficial' | 'nakama';
export type CrewInviteStatus = 'pending' | 'accepted' | 'declined';

export interface ProfileSummary {
  id: string;
  username: string | null;
  avatar_url: string | null;
  genero?: 'masculino' | 'femenino';
}

export interface Crew {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  user_id: string;
  role: CrewRole;
  joined_at: string;
  profile?: ProfileSummary | null;
}

export interface CrewInvite {
  id: string;
  crew_id: string;
  inviter_id: string;
  invitee_email: string;
  status: CrewInviteStatus;
  created_at: string;
  crew?: Crew | null;
  inviter_profile?: ProfileSummary | null;
}
