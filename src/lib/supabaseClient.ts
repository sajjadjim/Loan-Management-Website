import { createClient } from '@supabase/supabase-js';

// Primary Supabase Cloud DB
const primaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const primaryAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Secondary Supabase Cloud DB (Backup Cloud)
const secondaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_SECONDARY || '';
const secondaryAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SECONDARY || '';

export const isPrimaryConfigured = Boolean(primaryUrl && primaryAnonKey && primaryUrl.includes('supabase.co'));
export const isSecondaryConfigured = Boolean(secondaryUrl && secondaryAnonKey && secondaryUrl.includes('supabase.co'));

export const isSupabaseConfigured = isPrimaryConfigured || isSecondaryConfigured;

export const supabasePrimary = isPrimaryConfigured
  ? createClient(primaryUrl, primaryAnonKey)
  : null;

export const supabaseSecondary = isSecondaryConfigured
  ? createClient(secondaryUrl, secondaryAnonKey)
  : null;

// Legacy default export alias
export const supabase = supabasePrimary;
