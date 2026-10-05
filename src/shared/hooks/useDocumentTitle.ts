import { useEffect } from 'react';

export const APP_NAME = 'Northwind Admin';

export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
