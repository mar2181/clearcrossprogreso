import { createAdminClient } from './supabase/admin';

export const QUOTE_PHOTO_BUCKET = 'clearcross_quote_photos';
export const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Resolve a stored quote photo reference to a browser-usable URL.
 * - Legacy rows stored a full public URL → returned as-is.
 * - New rows store the private-bucket storage path → a short-lived signed URL
 *   is generated with the service-role client (photos are medical data and the
 *   bucket must be PRIVATE).
 */
export async function resolveQuotePhotoUrl(
  pathOrUrl: string | null
): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl; // legacy public URL
  const admin = createAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.storage
    .from(QUOTE_PHOTO_BUCKET)
    .createSignedUrl(pathOrUrl, 60 * 60); // 1 hour
  if (error) {
    console.error('Error signing quote photo URL:', error);
    return null;
  }
  return data.signedUrl;
}
