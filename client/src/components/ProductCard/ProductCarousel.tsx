import { useState } from 'react';
import type { Product_T } from '../../utils/types';
import { Link } from 'react-router-dom';

type Props = {
  products: Product_T[];
};

export default function ProductCarousel({ products }: Props) {
  const visibleCount = 3;
  // Calculate the maximum index
  const maxIndex = Math.max(products.length - visibleCount, 0);
  const [index, setIndex] = useState(0);

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden">
      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${index * 33.333}%)` }}
      >
        {products.map((p) => (
          <div key={p.id} className="w-1/3 shrink-0 p-2">
            <Link to={`/product/${p.id}`}>
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full aspect-4/5 object-cover rounded-lg"
              />
            </Link>
          </div>
        ))}
      </div>

      {index > 0 && (
        <button
          onClick={() => setIndex(i => i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-7xl font-bold text-white hover:text-red-800 transition"

        >
          ‹
        </button>
      )}

      {index < maxIndex && (
        <button
          onClick={() => setIndex(i => i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-7xl font-bold text-white hover:text-red-800 transition"

        >
          ›
        </button>
      )}
    </div>
  );
}
