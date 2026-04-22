import { useState, useCallback, useRef } from 'react';
import { SearchResultFood } from '../../../types/nutrition';

/* Hook to search for foods using the USDA API.
   Uses AbortController to cancel in-flight requests so stale results
   never overwrite a cleared or newer search.
*/
export function useFoodSearch() {
  const [results, setResults] = useState<SearchResultFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const searchAPI = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Cancel any in-flight request from a previous query
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await fetch(
        `/api/foods/search?q=${encodeURIComponent(searchQuery)}`,
        { signal: abortRef.current.signal }
      );
      const data = await response.json();
      setResults(data.products || []);
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Food search error:', error);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim().length < 2) {
        // Cancel any in progress request and clear instant
        if (abortRef.current) {
          abortRef.current.abort();
          abortRef.current = null;
        }
        setResults([]);
        setLoading(false);
        return;
      }

      // Show skeletons immediately while debounce is pending
      setLoading(true);

      debounceRef.current = setTimeout(() => {
        searchAPI(value);
      }, 400);
    },
    [searchAPI]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  return { results, loading, query, handleSearch, clearSearch };
}
