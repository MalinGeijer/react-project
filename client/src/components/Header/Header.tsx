import { Logo } from './Logo';
import { NavigationMenu } from './NavigationMenu';
import { Heart, ShoppingCartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import SearchBar from './SearchBar';
import { log } from '../../utils/logger';

export default function Header() {
  const { favorites } = useFavorites();
  const { cart } = useCart();
  const count = favorites.length;
  const cartCount = cart.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <header className="siteHeader border-b border-base-border">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center p-3 gap-3">
        <div className="shrink-0 w-full max-w-[420px] mx-auto md:mx-0">
          <Logo />
        </div>

        <div className="flex flex-row items-center justify-between w-full gap-4">
          <div className="flex-1">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            <Link to="/favorites" className="relative">
              <Heart
                className={`w-8 h-8 ${
                  count > 0
                    ? 'text-red-600 fill-red-600'
                    : 'text-base-muted fill-base-muted'
                }`}
              />
              {count > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] text-black pointer-events-none -translate-y-0.5">
                  {count}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative">
              <ShoppingCartIcon
                className={`w-8 h-8 ${
                  cartCount > 0
                    ? 'text-white fill-white'
                    : 'text-base-muted fill-base-muted'
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] text-black pointer-events-none translate-x-0.5 -translate-y-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center px-3 gap-4">
        <NavigationMenu />
      </div>
    </header>
  );
}
