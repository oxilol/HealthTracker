import { useState, useCallback, useRef } from 'react';
import { SearchResultFood } from '../../../types/nutrition';

/* Hook to search for foods using the Open Food Facts API. 
   Calls /api/foods/search. 
*/
export function useFoodSearch() {
  const [results, setResults] = useState<SearchResultFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchAPI = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.products || []);
    } catch (error) {
      console.error('Food search error:', error);
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        searchAPI(value);
      }, 400);
    },
    [searchAPI]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return { results, loading, query, handleSearch, clearSearch };
}
