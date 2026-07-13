// Simple in-memory sliding-window rate limiter.
// Serverless caveat: state is per warm instance, so this is best-effort
// abuse protection (stops rapid-fire spam), not a distributed quota.
type Window = { timestamps: number[] };

const buckets = new Map<string, Window>();
const MAX_BUCKETS = 10_000;

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }
  bucket.timestamps.push(now);
  return { allowed: true, remaining: limit - bucket.timestamps.length };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
