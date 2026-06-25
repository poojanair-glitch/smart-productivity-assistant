import { createBrowserClient } from '@supabase/ssr';

class MockSupabaseClient {
  auth = {
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const res = await fetch('/api/auth/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: { user: null, session: null }, error: { message: data.error || 'Invalid credentials' } };
        }
        return { data, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err.message || 'Connection failed' } };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const res = await fetch('/api/auth/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'signup',
            email,
            password,
            full_name: options?.data?.full_name || 'Smart User',
            avatar_url: options?.data?.avatar_url
          })
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: { user: null, session: null }, error: { message: data.error || 'Signup failed' } };
        }
        return { data, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err.message || 'Connection failed' } };
      }
    },
    signOut: async () => {
      try {
        await fetch('/api/auth/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' })
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
      document.cookie = 'sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return { error: null };
    },
    getUser: async () => {
      try {
        const res = await fetch('/api/auth/mock');
        const data = await res.json();
        if (!res.ok || !data.user) {
          return { data: { user: null }, error: { message: 'No active session' } };
        }
        return { data: { user: data.user }, error: null };
      } catch (err) {
        return { data: { user: null }, error: { message: 'Failed to fetch user' } };
      }
    },
    onAuthStateChange: (callback: any) => {
      // Triggers mock onAuthStateChange subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  from(table: string) {
    return {
      select: (columns: string) => {
        return {
          eq: (columnName: string, value: any) => {
            return {
              single: async () => {
                if (table === 'profiles') {
                  try {
                    const res = await fetch('/api/auth/mock');
                    const data = await res.json();
                    if (res.ok && data.user) {
                      return {
                        data: {
                          id: data.user.id,
                          full_name: data.user.user_metadata.full_name,
                          avatar_url: data.user.user_metadata.avatar_url,
                        },
                        error: null
                      };
                    }
                  } catch (e) {
                    console.error('Mock select profiles failed:', e);
                  }
                }
                return { data: null, error: { message: 'Profile not found' } };
              }
            };
          }
        };
      }
    };
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key || !url.startsWith('http')) {
    return new MockSupabaseClient() as any;
  }
  
  return createBrowserClient(url, key);
}
