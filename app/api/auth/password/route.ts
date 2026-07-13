import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHmac } from 'crypto';

/** Generate the expected session token value from the env secret.
 *  Both the API route (when issuing the cookie) and middleware (when
 *  validating it) derive the same value from AUTH_COOKIE_SECRET so
 *  the static string 'authenticated' is never stored in the cookie.
 */
function getExpectedCookieValue(): string {
    const secret = process.env.AUTH_COOKIE_SECRET || process.env.PROTECTION_PASSWORD || '';
    return createHmac('sha256', secret).update('clearCross_auth_v1').digest('hex');
}

/** Constant-time string comparison to prevent timing attacks. */
function safeEqual(a: string, b: string): boolean {
    try {
          const aBuf = Buffer.from(a, 'utf8');
          const bBuf = Buffer.from(b, 'utf8');
          if (aBuf.length !== bBuf.length) {
                  // Still run timingSafeEqual to avoid length-based timing leak;
            // compare against itself so it always returns false here.
            timingSafeEqual(aBuf, aBuf);
                  return false;
          }
          return timingSafeEqual(aBuf, bBuf);
    } catch {
          return false;
    }
}

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

      // Constant-time comparison to prevent timing attacks
      if (!safeEqual(password ?? '', correctPassword)) {
              return NextResponse.json(
                { error: 'Incorrect password' },
                { status: 401 }
                      );
      }

      // Password is correct — issue a signed session cookie
      const response = NextResponse.json({ success: true });
          const cookieValue = getExpectedCookieValue();

      response.cookies.set({
              name: 'clearCross_auth',
              value: cookieValue,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
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

/** Export the helper so middleware can import it without duplicating logic. */
