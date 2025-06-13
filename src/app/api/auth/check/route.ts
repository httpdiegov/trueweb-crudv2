import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin-auth');
    const isAuthenticated = authCookie?.value === 'true';

    if (!isAuthenticated) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Error checking authentication' },
      { status: 500 }
    );
  }
}
