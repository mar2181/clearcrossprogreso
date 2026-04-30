import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const correctPassword = process.env.PROTECTION_PASSWORD;

    if (!correctPassword) {
      // If no password is set, deny access
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (password !== correctPassword) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Password is correct, set a secure cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: 'clearCross_auth',
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
