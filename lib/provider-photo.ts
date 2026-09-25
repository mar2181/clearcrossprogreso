export const PROVIDER_PHOTO_BUCKET = 'clearcross_provider_photos';

// A provider's gallery is capped so one clinic can't fill the whole review
// queue (or the bucket) in one sitting. Counts pending + approved together.
export const MAX_PROVIDER_PHOTOS = 12;

/**
 * The bucket is PUBLIC (unlike clearcross_quote_photos, which is private
 * medical imagery behind signed URLs) — a provider gallery photo is meant
 * to render directly on the public page, so this is pure string
 * formatting, not a signed request. No client instance or network call
 * needed, so any server OR client component can call it.
 */
export function resolveProviderPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${PROVIDER_PHOTO_BUCKET}/${path}`;
}
