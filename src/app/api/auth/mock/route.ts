import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mockDb } from '@/lib/mockDb';

export async function POST(request: Request) {
  try {
    const { action, email, password, full_name, avatar_url } = await request.json();
    const cookieStore = await cookies();

    if (action === 'signup') {
      if (!email || !password || !full_name) {
        return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 });
      }

      const existingUser = mockDb.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
      }

      const newUser = mockDb.addUser({
        email,
        password,
        full_name,
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      });

      cookieStore.set('sb-mock-session', newUser.id, {
        path: '/',
        httpOnly: false, // Accessible client-side as well
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: {
            full_name: newUser.full_name,
            avatar_url: newUser.avatar_url,
          },
        },
        session: {
          access_token: 'mock-session-token',
          user: {
            id: newUser.id,
            email: newUser.email,
            user_metadata: {
              full_name: newUser.full_name,
              avatar_url: newUser.avatar_url,
            },
          },
        },
      });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = mockDb.getUserByEmail(email);
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      cookieStore.set('sb-mock-session', user.id, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            full_name: user.full_name,
            avatar_url: user.avatar_url,
          },
        },
        session: {
          access_token: 'mock-session-token',
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              full_name: user.full_name,
              avatar_url: user.avatar_url,
            },
          },
        },
      });
    }

    if (action === 'logout') {
      cookieStore.delete('sb-mock-session');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Mock auth API error:', error);
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('sb-mock-session')?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = mockDb.getUserById(userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Session verification error' }, { status: 500 });
  }
}
