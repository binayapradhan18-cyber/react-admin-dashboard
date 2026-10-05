import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { ErrorFallback } from '@/shared/ui';

function toError(error: unknown): Error {
  if (isRouteErrorResponse(error)) return new Error(`${error.status} ${error.statusText}`);
  if (error instanceof Error) return error;
  return new Error('Unexpected error');
}

/** Rendered by the router for errors thrown while rendering or lazy-loading a route. */
export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isChunkError =
    error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);

  return (
    <ErrorFallback
      title={isChunkError ? 'A new version is available' : 'This page crashed'}
      error={
        isChunkError ? new Error('Reload to get the latest version of the app.') : toError(error)
      }
      reset={() => {
        if (isChunkError) window.location.reload();
        else navigate(0);
      }}
    />
  );
}
