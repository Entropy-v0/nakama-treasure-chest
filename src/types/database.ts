import type { Item, ItemInsert, ItemUpdate } from './items';
import type { CrewRole, CrewInviteStatus } from './crew';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      items: {
        Row: Item;
        Insert: ItemInsert;
        Update: ItemUpdate;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          genero: 'masculino' | 'femenino';
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          genero?: 'masculino' | 'femenino';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          genero?: 'masculino' | 'femenino';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      crews: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      crew_members: {
        Row: {
          id: string;
          crew_id: string;
          user_id: string;
          role: CrewRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          user_id: string;
          role?: CrewRole;
          joined_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          user_id?: string;
          role?: CrewRole;
          joined_at?: string;
        };
        Relationships: [];
      };
      crew_invites: {
        Row: {
          id: string;
          crew_id: string;
          inviter_id: string;
          invitee_email: string;
          status: CrewInviteStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          inviter_id?: string;
          invitee_email: string;
          status?: CrewInviteStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          inviter_id?: string;
          invitee_email?: string;
          status?: CrewInviteStatus;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      item_tipo: 'Anime' | 'Manga' | 'Serie' | 'Película' | 'Libro';
      item_estado: 'Pendiente' | 'Viendo' | 'Completado' | 'Abandonado' | 'En Pausa';
      crew_role: CrewRole;
      crew_invite_status: CrewInviteStatus;
    };
  };
}
