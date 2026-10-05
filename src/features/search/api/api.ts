import { http } from '@/shared/lib/apiClient';
import type { SearchResults } from '../types';

export const searchApi = {
  search: (q: string, signal?: AbortSignal) =>
    http.get<SearchResults>('/search', { params: { q }, signal }),
};
