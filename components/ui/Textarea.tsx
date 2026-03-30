'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      showCharCount = false,
      maxLength,
      className,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    );

    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'placeholder:text-neutral-400',
            'resize-none',
            {
              'border-neutral-300 focus:border-brand-blue focus:ring-brand-blue':
                !error,
              'border-error focus:border-error focus:ring-error': error,
            },
            className
          )}
          {...props}
        />

        <div className="flex items-center justify-between mt-1.5">
          {errorMessage && (
            <p className="text-xs text-error">{errorMessage}</p>
          )}

          {showCharCount && maxLength && (
            <p className="text-xs text-neutral-500 ml-auto">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
