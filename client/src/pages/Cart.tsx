// src/pages/Cart.tsx
import { Link, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, increment, decrement, remove, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center text-base-muted mt-10">
        Din kundvagn är tom
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <table className="w-full border-collapse">
        <thead className="border-b border-base-border text-left text-sm text-base-muted">
          <tr>
            <th className="py-2">Produkt</th>
            <th>Pris</th>
            <th>Antal</th>
            <th>Summa</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {cart.map((item) => (
            <tr
              key={item.id}
              className="border-b border-base-border"
            >
              <td className="py-4 flex items-center gap-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-md"
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-base-muted">
                    {item.brand}
                  </div>
                </div>
              </td>

              <td>{item.price} kr</td>

              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decrement(item.id)}
                    className="p-1 border rounded-md"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increment(item.id)}
                    className="p-1 border rounded-md"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </td>

              <td className="font-medium">
                {item.price * item.quantity} kr
              </td>

              <td>
                <button
                  onClick={() => remove(item.id)}
                  className="text-base-muted hover:text-black"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>Totalt</span>
            <span>{total} kr</span>
          </div>
          <Link
            to="/checkout"
            className="w-full bg-black text-white py-3 rounded-md text-center block"
          >
            Checkout
          </Link>

        </div>
      </div>
    </div>
  );
}
