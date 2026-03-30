import { Suspense } from 'react';
import { searchAll, type SearchResult } from '@/lib/data';
import SearchResultsClient from '@/components/search/SearchResultsClient';
import SearchBar from '@/components/search/SearchBar';

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
    <main className="min-h-screen bg-white">
      {/* Header with search bar */}
      <div className="bg-gradient-to-br from-brand-blue/5 to-brand-green/5 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-4">
            Search Results
          </h1>
          <SearchBar variant="compact" defaultValue={query} />
          {query && (
            <p className="text-neutral-mid mt-3">
              {results.length} {results.length === 1 ? 'result' : 'results'} for{' '}
              <span className="font-semibold text-neutral-dark">&ldquo;{query}&rdquo;</span>
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        <Suspense fallback={<div className="text-neutral-400 py-12 text-center">Searching...</div>}>
          <SearchResultsClient results={results} query={query} />
        </Suspense>
      </div>
    </main>
  );
}
