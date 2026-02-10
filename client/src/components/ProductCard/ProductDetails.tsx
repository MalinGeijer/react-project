import { useEffect, useState } from 'react';
import type { Product_T } from '../../utils/types';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import ProductCarousel from './ProductCarousel';

type ProductDetailsProps = Product_T;

export default function ProductDetails({
  id,
  name,
  price,
  brand,
  image_url,
  description,
}: ProductDetailsProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(id);
  const { addToCart } = useCart();

  const [relatedProducts, setRelatedProducts] = useState<Product_T[]>([]);

  // Fetch 6 random products for the carousel when the component mounts
  useEffect(() => {
    fetch("/api/products/random")
      .then(res => res.json())
      .then(data => {
        console.log('relatedProducts', data);
        setRelatedProducts(data)
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Product details */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-base-surface border border-base-border rounded-xl p-6">
        <div className="relative w-full aspect-4/5 overflow-hidden rounded-lg">
          <button
            onClick={() => toggleFavorite(id)}
            className="absolute right-3 top-3 z-10"
          >
            <Heart
              className={`w-6 h-6 ${
                favorite
                  ? 'fill-red-600 text-red-600'
                  : 'text-base-muted fill-base-muted'
              }`}
            />
          </button>

          <img src={image_url} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{name}</h1>
            <p className="text-sm text-base-muted">{brand}</p>
          </div>

          <p className="text-lg font-medium">{price} kr</p>
          <p className="text-base">{description}</p>

          <button
            onClick={() =>
              addToCart({ id, name, price, brand, image_url, description })
            }
            className="mt-auto bg-base-muted text-black font-medium py-2 rounded-md hover:bg-base-hover transition"
          >
            Köp
          </button>
        </div>
      </div>

      {/* Carousel with 6 random products at the bottom */}
      <h3>Related Products</h3>
      {relatedProducts.length > 0 && (
        <ProductCarousel products={relatedProducts} />
      )}
    </div>
  );
}
