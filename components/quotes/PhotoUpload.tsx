'use client';

import React, { useCallback, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onFileSelect: (file: File | null) => void;
  preview?: string | null;
}

export function PhotoUpload({ onFileSelect, preview }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        Photo (optional)
      </label>

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-full px-6 py-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-200',
            'flex flex-col items-center justify-center gap-2',
            isDragging
              ? 'border-brand-blue bg-brand-blue/5'
              : 'border-neutral-300 hover:border-brand-blue hover:bg-neutral-50'
          )}
        >
          <Camera className="h-8 w-8 text-neutral-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-700">
              Drag and drop your image
            </p>
            <p className="text-xs text-neutral-500">
              or click to browse (JPEG, PNG, WebP • max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-64 object-cover rounded-lg border border-neutral-200"
          />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
