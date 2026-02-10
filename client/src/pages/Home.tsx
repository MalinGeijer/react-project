import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import type { Product_T } from '../utils/types';
import Hero from '../components/Hero/Hero';
import { useSearch } from '../context/SearchContext'; // ny import

export default function Home() {
  const [products, setProducts] = useState<Product_T[]>([]);
  const { searchQuery } = useSearch();

  // Fetch products from backend API on component mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product_T[]) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  // Filter products based on search query (case-insensitive, matches name, brand, description, id or price)
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const textMatch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    // Check if query is a number and matches id or price
    const numberMatch =
      !isNaN(Number(q)) && p.price === Number(q);
    return textMatch || numberMatch;
  });

  return (
    <div className="grid grid-cols-1 mx-auto place-items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2">
      <div className="col-span-full w-full">
        <Hero />
      </div>
      {/* Map filtered products to ProductCard components */}
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          brand={product.brand}
          price={product.price}
          image_url={product.image_url}
          description={product.description}
        />
      ))}

      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center text-base-muted mt-10">
          Inga produkter matchar din sökning
        </div>
      )}
    </div>
  );
}
