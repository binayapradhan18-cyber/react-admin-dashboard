import type { ReactNode } from 'react';
import type { Params } from 'react-router-dom';

/** Typed shape of `handle` on our route objects; read by the breadcrumbs. */
export interface RouteHandle {
  crumb?: string | ((params: Params) => ReactNode);
}

export function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null && 'crumb' in value;
}
