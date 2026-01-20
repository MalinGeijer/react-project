import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDetails from '../components/ProductCard/ProductDetails';
import type { Product_T } from '../utils/types';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product_T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Product_T) => setProduct(data)) // <-- typning med Product_T
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p>Laddar…</p>;
  }

  if (!product) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Vi hittade inte produkten</h2>
        <Link to="/" className="mt-4 inline-block text-brand-primary hover:underline">
          Tillbaka till alla produkter
        </Link>
      </div>
    );
  }

  return (
    <main className="p-6 flex justify-center">
      <ProductDetails {...product} />
    </main>
  );
}
