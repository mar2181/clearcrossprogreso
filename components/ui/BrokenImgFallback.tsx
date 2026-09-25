'use client';

// A plain <img onError={...}> cannot be written directly inside a Server
// Component — the handler function can't cross the RSC boundary. This is
// the one small client wrapper any server-rendered photo grid reaches for,
// so a deleted storage object degrades to a neutral placeholder instead of
// the browser's broken-image icon.
const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e5e5"/%3E%3C/svg%3E';

export default function BrokenImgFallback({
  src,
  alt = '',
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = PLACEHOLDER;
      }}
    />
  );
}
