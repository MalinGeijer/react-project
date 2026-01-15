import { Logo } from './Logo';
import { NavigationMenu } from './NavigationMenu';
import { SearchBar } from './SearchBar';
import { Heart, ShoppingCartIcon } from 'lucide-react';
import { useState } from 'react';

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user?.username || payload.email || null;
  } catch {
    return null;
  }
}

export default function Header() {
  const [user, setUser] = useState<string | null>(getUserFromToken());

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

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
            <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            <ShoppingCartIcon className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Navigation row: NavigationMenu + Inloggad-info */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center px-3 gap-4">

        {/* Navigationen */}
        <NavigationMenu />

        {/* Användardelen */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Inloggad som {user}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-base-muted rounded hover:text-base-hover"
            >
              Logout
            </button>
          </div>
        )}

      </div>


    </header>
  );
}
