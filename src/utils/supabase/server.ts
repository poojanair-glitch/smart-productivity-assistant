import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

class ServerMockSupabaseClient {
  private cookieStore: any;

  constructor(cookieStore: any) {
    this.cookieStore = cookieStore;
  }

  auth = {
    getUser: async () => {
      try {
        const userId = this.cookieStore.get('sb-mock-session')?.value;
        if (!userId) {
          return { data: { user: null }, error: null };
        }

        return {
          data: {
            user: {
              id: userId,
              email: 'mock@example.com',
              user_metadata: {
                full_name: 'Mock User',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
              }
            }
          },
          error: null
        };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },
    signOut: async () => {
      this.cookieStore.delete('sb-mock-session');
      return { error: null };
    }
  };
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const cookieStore = await cookies();

  if (!url || !key || !url.startsWith('http')) {
    return new ServerMockSupabaseClient(cookieStore) as any;
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if handled by Middleware session refresh
          }
        },
      },
    }
  );
}
