import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="flex flex-row gap-2 items-center relative">
      <Search className="w-6 h-6 text-base-muted absolute right-2" />
      <input type="text" placeholder="Search ..." />
    </div>
  );
}
