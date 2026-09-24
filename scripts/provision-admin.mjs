// Creates a clearcross_users account with role='admin' — the role
// app/admin/quotes/page.tsx and app/api/quotes/[id]/respond/route.ts's
// isAdmin check both already gate on, but which (like 'provider') had zero
// rows until now.
//
// Dry run by default. Nothing is written to the database without --apply.
//
// Usage:
//   node scripts/provision-admin.mjs --email=<your email> --name="Your Name" [--apply]
//
// Credentials: same lookup as provision-provider.mjs.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';

function parseArgs(argv) {
  const out = { apply: false };
  for (const a of argv.slice(2)) {
    if (a === '--apply') { out.apply = true; continue; }
    const m = a.match(/^--([a-z-]+)=(.*)$/);
    if (m) out[m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = m[2];
  }
  return out;
}

function readEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}

function loadCreds() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY,
      source: 'environment (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
    };
  }
  const fallback = 'C:/Users/mario/custom-designs-brain/.env';
  const env = readEnvFile(fallback);
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    return { url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_KEY, source: fallback };
  }
  return null;
}

function genPassword() {
  return randomBytes(9).toString('base64').replace(/[+/=]/g, 'x');
}

async function findExistingAuthUserId(sb, email) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data) return null;
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 200) return null;
    page++;
  }
  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.email || !args.name) {
    console.error('Usage: node scripts/provision-admin.mjs --email=<email> --name="Name" [--apply]');
    process.exit(1);
  }

  const creds = loadCreds();
  if (!creds) {
    console.error('No Supabase credentials found. Refusing to guess.');
    process.exit(1);
  }
  console.log(`Credentials from: ${creds.source}`);

  const sb = createClient(creds.url, creds.key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: existing } = await sb
    .from('clearcross_users')
    .select('id, role')
    .eq('email', args.email)
    .maybeSingle();

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`${args.email} already has an admin row (id=${existing.id}). Nothing to do.`);
      return;
    }
    if (!args.apply) {
      console.log(`Dry run: ${args.email} exists with role='${existing.role}'. Would promote to 'admin'.`);
      return;
    }
    const { error: updateErr } = await sb
      .from('clearcross_users')
      .update({ role: 'admin' })
      .eq('id', existing.id);
    if (updateErr) {
      console.error('Failed to promote existing row:', updateErr.message);
      process.exit(1);
    }
    console.log(`✓ ${args.email} promoted to role='admin'. Sign in as usual at /auth/login.`);
    return;
  }

  const password = args.password || genPassword();

  console.log(`\nWould create: ${args.email} / role=admin / ${args.name}`);
  if (!args.apply) {
    console.log('Dry run only — nothing written. Re-run with --apply to actually create this account.');
    return;
  }

  let authUserId;
  const { data: authUser, error: authErr } = await sb.auth.admin.createUser({
    email: args.email,
    password,
    email_confirm: true,
  });
  if (authErr?.message?.includes('already been registered')) {
    // This is a SHARED Supabase project — the email may already have an
    // auth.users row from an unrelated product. Reuse it rather than fail;
    // clearcross_users is the table that's actually missing.
    authUserId = await findExistingAuthUserId(sb, args.email);
    if (!authUserId) {
      console.error('Auth says this email is registered, but it could not be found via listUsers(). Aborting.');
      process.exit(1);
    }
    console.log(`(email already had an auth.users row on this shared project — reusing id ${authUserId}, password unchanged)`);
  } else if (authErr || !authUser?.user) {
    console.error('Failed to create auth user:', authErr?.message);
    process.exit(1);
  } else {
    authUserId = authUser.user.id;
  }

  const { error: insertErr } = await sb.from('clearcross_users').insert({
    id: authUserId,
    email: args.email,
    full_name: args.name,
    role: 'admin',
  });
  if (insertErr) {
    console.error('clearcross_users insert failed — clean up manually:', insertErr.message);
    console.error(`  Auth user id: ${authUserId}`);
    process.exit(1);
  }

  console.log('\n✓ Provisioned.');
  console.log(`  Login: ${args.email}`);
  if (authUser?.user) {
    console.log(`  Password: ${password}`);
  } else {
    console.log(`  This email already had a login on this shared project — use its EXISTING password, not a new one.`);
    console.log(`  If you've forgotten it, use "Forgot password" at /auth/login.`);
  }
  console.log(`  Sign in at /auth/login, then visit /admin/quotes.`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
