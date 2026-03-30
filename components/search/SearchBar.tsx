'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  variant?: 'hero' | 'mobile' | 'compact';
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export default function SearchBar({
  variant = 'hero',
  placeholder = 'Search for a procedure or provider...',
  className,
  defaultValue = '',
}: SearchBarProps) {

  if (variant === 'mobile') {
    return (
      <form action="/search" method="GET" className={cn('w-full', className)}>
        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <Search className="w-4 h-4 text-white/50 ml-3 flex-shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            required
            minLength={2}
            className="flex-1 px-3 py-2.5 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2.5 bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/80 transition-colors"
          >
            Go
          </button>
        </div>
      </form>
    );
  }

  if (variant === 'compact') {
    return (
      <form action="/search" method="GET" className={cn('w-full', className)}>
        <div className="flex items-center bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden hover:border-brand-blue/40 transition-colors">
          <Search className="w-4 h-4 text-neutral-400 ml-3 flex-shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            required
            minLength={2}
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-blue text-white text-sm font-medium hover:bg-brand-navy transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    );
  }

  // Hero variant (desktop)
  return (
    <form action="/search" method="GET" className={cn('w-full', className)}>
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
          <input
            type="text"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            required
            minLength={2}
            className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none font-sans"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-brand-blue text-white hover:bg-brand-navy transition-colors flex items-center gap-2"
          >
            <Search size={20} />
          </button>
        </div>
      </div>
    </form>
  );
}
