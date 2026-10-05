import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchApi } from './api';

export const MIN_QUERY_LENGTH = 2;

export const searchKeys = {
  query: (q: string) => ['search', q] as const,
};

export function useGlobalSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: searchKeys.query(term),
    queryFn: ({ signal }) => searchApi.search(term, signal),
    enabled: term.length >= MIN_QUERY_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
