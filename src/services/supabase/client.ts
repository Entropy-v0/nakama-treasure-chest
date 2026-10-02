import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  isValidHttpUrl(rawUrl) &&
  !rawUrl.includes('your_supabase_url') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('tu-proyecto') &&
  rawKey !== 'your_supabase_anon_key' &&
  rawKey !== 'placeholder-key'
);

// Fallback dummy seguro para instanciar el cliente sin arrojar error cuando no está configurado
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient<Database>(
  isSupabaseConfigured ? rawUrl : fallbackUrl,
  isSupabaseConfigured ? rawKey : fallbackKey
);
