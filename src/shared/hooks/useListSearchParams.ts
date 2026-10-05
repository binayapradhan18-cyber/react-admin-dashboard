import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { z } from 'zod';

type Primitive = string | number;

export interface UpdateOptions {
  /** Replace the history entry instead of pushing (used for keystroke-driven changes). */
  replace?: boolean;
}

function serialize<T extends Record<string, Primitive>>(values: T, defaults: T): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === '' || value === defaults[key]) continue;
    params.set(key, String(value));
  }
  return params;
}

/**
 * Treats URL search params as the source of truth for list state (page, sort,
 * filters). Values are parsed with a Zod schema whose fields use `.catch()` so
 * hand-edited or stale URLs degrade to defaults instead of throwing. Any change
 * other than `page` resets pagination to the first page.
 */
export function useListSearchParams<T extends { page: number } & Record<string, Primitive>>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  defaults: T,
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(
    () => schema.parse(Object.fromEntries(searchParams)),
    [schema, searchParams],
  );

  const update = useCallback(
    (patch: Partial<T>, options: UpdateOptions = {}) => {
      setSearchParams(
        (previous) => {
          const current = schema.parse(Object.fromEntries(previous));
          const next: T = { ...current, ...patch };
          const touchesFilters = Object.keys(patch).some((key) => key !== 'page');
          if (touchesFilters && patch.page === undefined) next.page = 1;
          return serialize(next, defaults);
        },
        { replace: options.replace ?? false },
      );
    },
    [schema, defaults, setSearchParams],
  );

  const reset = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  return { params, update, reset };
}
