'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Reached one of two ways: (1) a password-recovery email link, which
// /auth/callback already exchanged for a real session before sending the
// visitor here, or (2) a signed-in user who came here on purpose to change
// their password. Both cases are the same form — "set a new password for
// whoever this session belongs to" — so there is nothing here that needs to
// know which path was taken.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Choose a password at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center border-b border-neutral-100">
              <h1 className="text-2xl font-bold text-neutral-900">Link expired</h1>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-neutral-600 text-sm">
                This password reset link is no longer valid — it may have already
                been used, or it may have expired. Request a new one from the sign-in
                page.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                Back to sign in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-brand-blue text-white rounded-lg px-4 py-2 font-bold text-xl">
            ClearCross
          </div>
          <p className="text-neutral-600 text-sm mt-2">Nuevo Progreso</p>
        </div>

        <Card>
          <CardHeader className="text-center border-b border-neutral-100">
            <h1 className="text-2xl font-bold text-neutral-900">Set a new password</h1>
            <p className="text-neutral-600 text-sm mt-1">
              Pick something you'll remember next time.
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-3 bg-brand-green-light text-brand-green rounded-lg text-sm">
                Password updated. Taking you to your dashboard...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Save new password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
