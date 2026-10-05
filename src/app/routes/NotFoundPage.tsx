import { Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EmptyState } from '@/shared/ui';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();
  return (
    <EmptyState
      icon={<Compass size={22} />}
      title="Page not found"
      description={
        <>
          Nothing lives at <code>{pathname}</code>. It may have moved, or the link is broken.
        </>
      }
      action={<Link to="/">Go to dashboard</Link>}
    />
  );
}
