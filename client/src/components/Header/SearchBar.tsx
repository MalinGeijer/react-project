import { useSearch } from '../../context/SearchContext';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const { setSearchQuery } = useSearch();

  return (
    <header className="siteHeader border-b border-base-border p-3">
      <div className="flex flex-row gap-2 items-center relative">
        <Search className="w-6 h-6 text-base-muted absolute right-2 pointer-events-none" />
        <input
          type="text"
          placeholder="Sök produkter..."
          className="w-full border border-base-border text-base-muted rounded-md px-3 py-2 pr-10"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  );
}
