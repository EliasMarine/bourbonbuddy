import { createClient } from '@supabase/supabase-js';

// Supabase client for browser usage (with anon key)
export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing required environment variables for Supabase');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Supabase client for server usage (with service key)
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing required environment variables for Supabase');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// Helper for getting public URLs
export const getStoragePublicUrl = (bucket: string, path: string) => {
  const client = createSupabaseBrowserClient();
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

// Admin client - only use on server-side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
); 