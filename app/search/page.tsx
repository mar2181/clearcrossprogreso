import { Suspense } from 'react';
import { searchAll, type SearchResult } from '@/lib/data';
import SearchResultsClient from '@/components/search/SearchResultsClient';
import SearchBar from '@/components/search/SearchBar';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  let results: SearchResult[] = [];
  if (query.length >= 2) {
    results = await searchAll(query);
  }

  return (
    <main className="min-h-screen bg-neutral-50/50">
      {/* Search header */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                Search Results
              </h1>
              {query && (
                <p className="text-blue-200/70 text-sm">
                  {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          </div>
          <SearchBar variant="compact" defaultValue={query} />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 md:pb-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
            <span className="text-neutral-400">Searching...</span>
          </div>
        }>
          <SearchResultsClient results={results} query={query} />
        </Suspense>
      </div>
    </main>
  );
}
