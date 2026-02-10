import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { Product_T } from '../utils/types';

export default function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product_T[]>([]);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newImage, setNewImage] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Simple auth check - check if "adminToken" exists in localStorage, if not redirect to login
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) navigate('/login');
  }, [navigate]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Kunde inte hämta produkter');
      const data = await res.json();
      setProducts(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Kunde inte hämta produkter');
    }
  };

  // Add product
  const addProduct = async () => {
    if (!newName || !newBrand || newPrice <= 0 || !newImage) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          brand: newBrand,
          description: newDescription,
          price: newPrice,
          image_url: newImage,
        }),
      });

      if (!res.ok) throw new Error('Kunde inte lägga till produkten');

      // Reset inputs
      setNewName('');
      setNewBrand('');
      setNewDescription('');
      setNewPrice(100);
      setNewImage('');

      fetchProducts();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Kunde inte lägga till produkten');
    }
  };

  // Delete product with confirmation
  const confirmDelete = (id: number) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);
  const proceedDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Kunde inte ta bort produkten');
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Kunde inte ta bort produkten');
    } finally {
      setDeleteId(null);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Logga ut
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-6">{error}</div>
      )}

      {/* Add product */}
      <div className="mb-8 flex flex-col gap-3">
        <h2 className="font-bold text-lg">Lägg till produkt</h2>
        <input
          type="text"
          placeholder="Produktnamn"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="p-2 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Brand"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          className="p-2 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Produktbeskrivning"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="p-2 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none"
        />
        <input
          type="number"
          placeholder="300" min={100} max={10000} step={50}
          value={newPrice}
          onChange={(e) => setNewPrice(Number(e.target.value))}
          className="p-2 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          className="p-2 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none"
        />
        <button
          onClick={addProduct}
          disabled={!newName || !newBrand || newPrice <= 0 || !newImage}
          className={`p-2 rounded text-white font-semibold transition ${
            newName && newBrand && newPrice > 0 && newImage
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-500 cursor-not-allowed'
          }`}
        >
          Lägg till
        </button>
      </div>

      {/* Produktlista */}
      <h2 className="font-bold text-lg mb-2">Produktlista</h2>
      <div className="overflow-x-auto rounded shadow">
        <table className="w-full table-auto">
          <thead className="bg-zinc-700 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Namn</th>
              <th className="px-4 py-2 text-left">Brand</th>
              <th className="px-4 py-2 text-left">Pris</th>
              <th className="px-4 py-2 text-left">Bild</th>
              <th className="px-4 py-2 text-center">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className={i % 2 === 0 ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white'}
              >
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.brand}</td>
                <td className="px-4 py-2">{p.price}</td>
                <td className="px-4 py-2">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => confirmDelete(p.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <p className="mb-4">Är du säker på att du vill ta bort produkten?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Avbryt
              </button>
              <button
                onClick={proceedDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
