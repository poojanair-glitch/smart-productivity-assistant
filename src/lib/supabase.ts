import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Instantiate only if configurations exist to prevent boot errors in local mode
export const isSupabaseConfigured = (() => {
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const urlLower = supabaseUrl.toLowerCase();
  const keyLower = supabaseAnonKey.toLowerCase();
  if (
    urlLower.includes('placeholder') ||
    urlLower.includes('your_') ||
    keyLower.includes('placeholder') ||
    keyLower.includes('your_')
  ) {
    return false;
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
})();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
