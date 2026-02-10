import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/site';

export function NavigationMenu() {
  const adminToken = localStorage.getItem('adminToken');
  const adminHref = adminToken ? '/admin' : '/login';

  return (
    <nav className="flex text-base p-4 text-base-muted flex-row gap-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          to={item.label === 'Admin' ? adminHref : item.href}
          className="transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-0.4 hover:text-base-hover">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
