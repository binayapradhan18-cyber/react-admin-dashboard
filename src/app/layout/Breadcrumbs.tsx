import { ChevronRight, Home } from 'lucide-react';
import { Link, useMatches } from 'react-router-dom';
import { isRouteHandle } from '../routes/handle';
import styles from './Breadcrumbs.module.css';

export function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches.flatMap((match) => {
    if (!isRouteHandle(match.handle) || match.handle.crumb === undefined) return [];
    const { crumb } = match.handle;
    return [
      {
        id: match.id,
        to: match.pathname,
        label: typeof crumb === 'function' ? crumb(match.params) : crumb,
      },
    ];
  });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        <li>
          <Link to="/" aria-label="Home" className={styles.home}>
            <Home size={14} />
          </Link>
        </li>
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={item.id}>
              <ChevronRight size={14} aria-hidden="true" className={styles.separator} />
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
