import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import type { Product_T } from '../utils/types';
import Hero from '../components/Hero/Hero';

// Home component to display a grid of products
export default function Home() {
  // State to hold the list of products
  const [products, setProducts] = useState<Product_T[]>([]);

  // Fetch products when the component mounts (only once)
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product_T[]) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  // Render the grid of ProductCard components
  return (
    <div className="grid grid-cols-1 mx-auto place-items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2">
        <div className="col-span-full w-full">
          <Hero />
        </div>
      {products.map((product) => (
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
    </div>
  );
}
