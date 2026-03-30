'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

const PROVIDER_CATEGORIES = [
  'Dentistry',
  'Pharmacy',
  'Surgery',
  'Wellness & Spa',
  'Vision Care',
  'Specialty',
  'Orthotics & Prosthetics',
];

export default function RegisterPage() {
  const [role, setRole] = useState<'patient' | 'provider'>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [category, setCategory] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Failed to create account');
        setLoading(false);
        return;
      }

      // Step 2: Create user record
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role,
      });

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      // Step 3: If provider, create provider record
      if (role === 'provider') {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .insert({
            name: clinicName,
            slug: clinicName
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-'),
            category_id: category,
            phone: phone || null,
            whatsapp: whatsapp || null,
            address: '',
          })
          .select('id')
          .single();

        if (providerError) {
          setError(providerError.message);
          setLoading(false);
          return;
        }

        // Update user with provider_id
        await supabase
          .from('users')
          .update({ provider_id: providerData.id })
          .eq('id', data.user.id);
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-4 text-4xl">✓</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-neutral-600 mb-6">
                Please check your email to verify your account and complete
                registration.
              </p>
              <Link href="/auth/login">
                <Button variant="primary" size="lg" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
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
            <h1 className="text-2xl font-bold text-neutral-900">Create Account</h1>
            <p className="text-neutral-600 text-sm mt-1">Join our community</p>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Role Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setRole('patient');
                  setClinicName('');
                  setCategory('');
                  setWhatsapp('');
                  setError('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  role === 'patient'
                    ? 'bg-brand-blue text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                I'm a Patient
              </button>
              <button
                onClick={() => {
                  setRole('provider');
                  setError('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  role === 'provider'
                    ? 'bg-brand-blue text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                I'm a Provider
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />

              {role === 'provider' && (
                <>
                  <Input
                    label="Clinic/Business Name"
                    type="text"
                    placeholder="Your clinic name"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a category</option>
                    {PROVIDER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="WhatsApp Number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    disabled={loading}
                  />
                </>
              )}

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Create Account
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <p className="text-sm text-neutral-600 text-center">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-brand-blue font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
