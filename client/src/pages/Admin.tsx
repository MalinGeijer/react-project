import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Product_T } from '../utils/types';

export default function Admin() {
  const [products, setProducts] = useState<Product_T[]>([]);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert('Kunde inte hämta produkter');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    if (!newName || !newBrand || newPrice <= 0 || !newDescription || !newImage) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          brand: newBrand,
          price: newPrice,
          description: newDescription,
          image_url: newImage,
        }),
      });

      if (!res.ok) throw new Error('Failed to add product');

      // Reset inputs
      setNewName('');
      setNewBrand('');
      setNewPrice(0);
      setNewDescription('');
      setNewImage('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Kunde inte lägga till produkten');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort produkten?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Kunde inte ta bort produkten');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Lägg till produkt */}
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="font-bold mb-2">Lägg till produkt</h2>
        <input
          type="text"
          placeholder="Produktnamn"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="p-2 rounded text-base-muted"
        />
        <input
          type="text"
          placeholder="Brand"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          className="p-2 rounded text-base-muted"
        />
        <input
          type="number"
          placeholder="Pris"
          value={newPrice}
          onChange={(e) => setNewPrice(Number(e.target.value))}
          className="p-2 rounded text-base-muted"
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="p-2 rounded text-base-muted"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          className="p-2 rounded text-base-muted"
        />
        <button
          onClick={addProduct}
          disabled={!newName || !newBrand || newPrice <= 0 || !newDescription || !newImage}
          className={`p-2 rounded text-white ${
            newName && newBrand && newPrice > 0 && newDescription && newImage
              ? 'bg-green-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Lägg till
        </button>
      </div>

      {/* Produktlista */}
      <h2 className="font-bold mb-2">Produktlista</h2>
      {loading ? (
        <p>Laddar produkter...</p>
      ) : (
        <table className="border-collapse border border-black w-full">
          <thead>
            <tr className="border-b">
              <th className="border p-2">Namn</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Pris</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.brand}</td>
                <td className="border p-2">{p.description}</td>
                <td className="border p-2">{p.price}</td>
                <td className="border p-2">
                  <img src={p.image_url} alt={p.name} className="h-12 w-12 object-cover" />
                </td>
                <td className="border p-2 text-center">
                  <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
