export type SortOrder = 'asc' | 'desc';

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
