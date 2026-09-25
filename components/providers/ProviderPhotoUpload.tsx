'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Clock, Loader2, Upload, X } from 'lucide-react';
import { MAX_PROVIDER_PHOTOS } from '@/lib/provider-photo';
import type { Locale } from '@/lib/i18n/context';
import { dictFor } from '@/lib/i18n/dict';

interface PhotoRef {
  path: string;
  url: string;
}

interface ProviderPhotoUploadProps {
  providerId: string;
  live: PhotoRef[];
  pending: PhotoRef[];
  locale: Locale;
}

export default function ProviderPhotoUpload({ providerId, live, pending, locale }: ProviderPhotoUploadProps) {
  const t = dictFor(locale).provider;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingPath, setRemovingPath] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalCount = live.length + pending.length;
  const atLimit = totalCount >= MAX_PROVIDER_PHOTOS;

  const handleFile = async (file: File) => {
    setMessage(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`/api/providers/${providerId}/photos`, {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Photo upload rejected:', data.error);
        setMessage({ type: 'error', text: t.photosErrorUpload });
        return;
      }
      setMessage({ type: 'success', text: t.photosSuccessSubmit });
      router.refresh();
    } catch (err) {
      console.error('Photo upload failed:', err);
      setMessage({ type: 'error', text: t.photosErrorGeneric });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async (path: string) => {
    setMessage(null);
    setRemovingPath(path);
    try {
      const res = await fetch(`/api/providers/${providerId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Photo remove rejected:', data.error);
        setMessage({ type: 'error', text: t.photosErrorRemove });
        return;
      }
      router.refresh();
    } catch (err) {
      console.error('Photo remove failed:', err);
      setMessage({ type: 'error', text: t.photosErrorGeneric });
    } finally {
      setRemovingPath(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <label
          htmlFor="photo-upload"
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 px-4 text-center transition-colors ${
            uploading || atLimit
              ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed'
              : 'border-neutral-300 hover:border-brand-blue hover:bg-brand-blue/5 cursor-pointer'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-neutral-400" />
          )}
          <span className="text-sm font-medium text-neutral-700">
            {atLimit
              ? t.photosLimitReached.replace('{n}', String(MAX_PROVIDER_PHOTOS))
              : uploading
                ? t.photosUploading
                : t.photosClickToUpload}
          </span>
          {!atLimit && (
            <span className="text-xs text-neutral-400">{t.photosFileHint}</span>
          )}
          <input
            id="photo-upload"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            disabled={uploading || atLimit}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        {message && (
          <div
            className={`flex items-center gap-2 mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            {t.photosWaitingReview.replace('{n}', String(pending.length))}
          </h3>
          <PhotoGrid photos={pending} onRemove={handleRemove} removingPath={removingPath} badge={t.photosPending} removeLabel={t.photosRemoveAria} />
        </div>
      )}

      {live.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            {t.photosLive.replace('{n}', String(live.length))}
          </h3>
          <PhotoGrid photos={live} onRemove={handleRemove} removingPath={removingPath} removeLabel={t.photosRemoveAria} />
        </div>
      )}

      {totalCount === 0 && (
        <p className="text-sm text-neutral-500">{t.photosEmpty}</p>
      )}
    </div>
  );
}

function PhotoGrid({
  photos,
  onRemove,
  removingPath,
  badge,
  removeLabel,
}: {
  photos: PhotoRef[];
  onRemove: (path: string) => void;
  removingPath: string | null;
  badge?: string;
  removeLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo) => (
        <div
          key={photo.path}
          className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e5e5"/%3E%3C/svg%3E';
            }}
          />
          {badge && (
            <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(photo.path)}
            disabled={removingPath === photo.path}
            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors disabled:opacity-50"
            aria-label={removeLabel}
          >
            {removingPath === photo.path ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
