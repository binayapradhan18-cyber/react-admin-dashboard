import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EmptyState } from '@/shared/ui';

export function ForbiddenPage() {
  useDocumentTitle('Access denied');
  return (
    <EmptyState
      icon={<ShieldX size={22} />}
      title="You don't have access to this page"
      description="Your role does not include the permission required here. Contact an administrator if you think this is a mistake."
      action={<Link to="/">Back to dashboard</Link>}
    />
  );
}
