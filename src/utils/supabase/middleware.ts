import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  let user: any = null;

  if (!supabaseUrl || !key || !supabaseUrl.startsWith('http')) {
    // Mock authentication mode: check sb-mock-session cookie
    const userId = request.cookies.get('sb-mock-session')?.value;
    if (userId) {
      if (userId.startsWith('user-') || userId === 'default-user-id') {
        user = {
          id: userId,
          email: 'mock@example.com',
          user_metadata: {
            full_name: 'Mock User',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
          }
        };
      }
    }
  } else {
    const supabase = createServerClient(
      supabaseUrl,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Retrieve user session state
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Configuration of public pages
  const isAuthPage = path.startsWith('/login') || 
                     path.startsWith('/signup') || 
                     path.startsWith('/forgot-password') ||
                     path.startsWith('/auth/callback');

  const isLandingPage = path === '/';
  const isPublicPage = isLandingPage || isAuthPage;

  // Bypass system requests and standard APIs
  const isStaticAsset = path.startsWith('/_next') || 
                        path.includes('/favicon.ico') || 
                        path.match(/\.(png|jpg|jpeg|svg|gif|json)$/);
  
  const isApi = path.startsWith('/api');

  if (isStaticAsset) {
    return supabaseResponse;
  }

  // Auth gate checks
  if (!user && !isPublicPage && !isApi) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
