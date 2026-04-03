'use client';

import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  variant?: 'hero' | 'mobile' | 'compact';
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  buttonText?: string;
}

export default function SearchBar({
  variant = 'hero',
  placeholder = 'Search for a procedure or provider...',
  className,
  defaultValue = '',
  buttonText,
}: SearchBarProps) {
  const pathname = usePathname();
  const isEs = pathname.startsWith('/es');
  const goText = buttonText || (isEs ? 'Ir' : 'Go');
  const searchText = buttonText || (isEs ? 'Buscar' : 'Search');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get('q') as string || '').trim();
    if (q.length >= 2) {
      const isEs = window.location.pathname.startsWith('/es');
      const prefix = isEs ? '/es' : '';
      window.location.href = prefix + '/search?q=' + encodeURIComponent(q);
    }
  }

  if (variant === 'mobile') {
    return (
      <form onSubmit={handleSubmit} className={cn('w-full', className)}>
        <div className="flex items-center bg-white rounded-xl shadow-xl overflow-hidden ring-1 ring-black/10">
          <Search className="w-4 h-4 text-brand-blue ml-3 flex-shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="flex-1 px-3 py-3 bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-brand-blue text-white text-xs font-semibold hover:bg-brand-navy transition-colors"
          >
            {goText}
          </button>
        </div>
      </form>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn('w-full max-w-2xl', className)}>
        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden shadow-lg">
          <Search className="w-4 h-4 text-white/50 ml-4 flex-shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="flex-1 px-3 py-3 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors border-l border-white/10"
          >
            {searchText}
          </button>
        </div>
      </form>
    );
  }

  // Hero variant (desktop)
  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
          <input
            type="text"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholder}
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
