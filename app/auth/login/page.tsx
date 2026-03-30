'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [mode, setMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const finalRedirect =
          userData?.role === 'provider' ? '/provider' : '/dashboard';
        router.push(finalRedirect);
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      setSuccess(`Magic link sent to ${email}. Check your email!`);
      setEmail('');
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'password') {
      handlePasswordSignIn(e);
    } else {
      handleMagicLinkSignIn(e);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-block bg-brand-blue text-white rounded-lg px-4 py-2 font-bold text-xl">
          ClearCross
        </div>
        <p className="text-neutral-600 text-sm mt-2">Nuevo Progreso</p>
      </div>

      {/* Card */}
      <Card>
        <CardHeader className="text-center border-b border-neutral-100">
          <h1 className="text-2xl font-bold text-neutral-900">Sign In</h1>
          <p className="text-neutral-600 text-sm mt-1">Welcome back!</p>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('password');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                mode === 'password'
                  ? 'bg-brand-blue text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setMode('magic-link');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                mode === 'magic-link'
                  ? 'bg-brand-blue text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-brand-green-light text-brand-green rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            {mode === 'password' && (
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {mode === 'password' ? 'Sign In' : 'Send Magic Link'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-sm text-neutral-600 text-center">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-brand-blue font-semibold hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center text-neutral-500">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
