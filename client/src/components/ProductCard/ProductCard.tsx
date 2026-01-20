import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product_T } from '../../utils/types';
import { useFavorites } from '../../context/FavoritesContext';

export default function ProductCard({
  id,
  name,
  brand,
  price,
  image_url,
}: Product_T) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(id);

  return (
    <Link
      to={`/product/${id}`}
      className="relative w-full max-w-[400px] rounded-xl bg-base-surface border border-black hover:scale-101 transition-transform duration-200"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(id);
        }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        className="absolute right-3 top-3 z-10"
      >
        <Heart
          className={`w-6 h-6 transition ${
            favorite
              ? 'fill-red-600 text-red-600'
              : 'text-base-muted fill-base-muted'
          }`}
        />
      </button>

      <div className="aspect-4/5 w-full overflow-hidden rounded-t-xl">
        <img src={image_url} alt={name} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-row m-3">
        <div className="flex flex-col flex-1">
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-base-muted">{brand}</p>
        </div>
        <p className="mt-1 text-sm font-semibold">{price} kr</p>
      </div>
    </Link>
  );
}
