import { Logo } from './Logo';
import { NavigationMenu } from './NavigationMenu';
import { SearchBar } from './SearchBar';
import { Heart, ShoppingCartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';

export default function Header() {
  const { favorites } = useFavorites();
  const count = favorites.length;
  return (
    <header className="siteHeader border-b border-base-border">
      {/* Top row: Logo, Search & Icons */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center p-3 gap-3">
        <div className="shrink-0 w-full max-w-[420px] mx-auto md:mx-0">
          <Logo />
        </div>

        <div className="flex flex-row items-center justify-between w-full gap-4">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            {/* <Heart className="w-6 h-6 text-red-600 fill-red-600" /> */}
            <Link to="/favorites" className="relative">
              <Heart
                className={`w-6 h-6 ${
                  count > 0
                    ? 'text-red-600 fill-red-600'
                    : 'text-base-muted fill-base-muted'
                }`}
              />
              {count > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-[12px] text-black pointer-events-none">
                  {count}
                </span>
              )}
            </Link>

            <ShoppingCartIcon className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Navigation row: NavigationMenu + Inloggad-info */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center px-3 gap-4">
        {/* Navigationen */}
        <NavigationMenu />
      </div>
    </header>
  );
}
