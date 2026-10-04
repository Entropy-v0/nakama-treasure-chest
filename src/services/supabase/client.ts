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

// Soporte explícito para aislar desarrollo local con datos mock
const forceMock = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true';

export const isSupabaseConfigured: boolean = !forceMock && Boolean(
  rawUrl &&
  rawKey &&
  isValidHttpUrl(rawUrl) &&
  !rawUrl.includes('your_supabase_url') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('tu-proyecto') &&
  rawKey !== 'your_supabase_anon_key' &&
  rawKey !== 'placeholder-key'
);

if (import.meta.env.DEV) {
  if (forceMock) {
    console.info('⚡ [Nakama] Modo Mock forzado activo (VITE_USE_MOCK=true). Usando datos locales sin Supabase.');
  } else if (!isSupabaseConfigured) {
    console.info('⚡ [Nakama] Supabase no configurado. Operando en modo Mock local con datos en memoria.');
  } else {
    console.info('⚡ [Nakama] Conectado a Supabase en la nube.');
  }
}

// Fallback dummy seguro para instanciar el cliente sin arrojar error cuando no está configurado
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient<Database>(
  isSupabaseConfigured ? rawUrl : fallbackUrl,
  isSupabaseConfigured ? rawKey : fallbackKey
);
