import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const [address, setAddress] = useState({
    name: "",
    street: "",
    zip: "",
    city: "",
    email: "",
  });
  const [success, setSuccess] = useState(false);

  if (cart.length === 0 && !success) {
    return (
      <div className="text-center mt-10 text-base-muted">
        Din kundvagn är tom
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Tack för din beställning!
        </h2>
        <p>Vi har mottagit din order och återkommer med bekräftelse.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      {/* Produkttabell */}
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-base-border text-left text-base-muted">
          <tr>
            <th className="py-2">Produkt</th>
            <th>Pris</th>
            <th>Antal</th>
            <th>Summa</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id} className="border-b border-base-border">
              <td className="py-2">{item.name}</td>
              <td>{item.price} kr</td>
              <td>{item.quantity}</td>
              <td>{item.price * item.quantity} kr</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold border-t">
            <td colSpan={3} className="text-right py-2">Totalt</td>
            <td className="py-2">{total} kr</td>
          </tr>
        </tfoot>
      </table>

      {/* Leveransadress */}
      <div className="max-w-md space-y-3 mt-6">
        <h2 className="text-lg font-medium">Leveransadress</h2>
        <input
          className="p-2 rounded text-base-muted w-full"
          name="name"
          placeholder="Namn"
          value={address.name}
          onChange={handleChange}
        />
        <input
          className="p-2 rounded text-base-muted w-full"
          name="street"
          placeholder="Gatuadress"
          value={address.street}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input
            className="p-2 rounded text-base-muted w-32"
            name="zip"
            placeholder="Postnummer"
            value={address.zip}
            onChange={handleChange}
          />
          <input
            className="p-2 rounded text-base-muted flex-1"
            name="city"
            placeholder="Ort"
            value={address.city}
            onChange={handleChange}
          />
        </div>
        <input
          className="p-2 rounded text-base-muted w-full"
          name="email"
          placeholder="E-post"
          value={address.email}
          onChange={handleChange}
        />
      </div>

      {/* Beställ-knapp */}
      <button
        onClick={() => {
          setSuccess(true);
          clearCart();       // töm kundvagnen
        }}
        className="w-full max-w-md bg-black text-white py-3 rounded-md mt-4"
      >
        Beställ
      </button>
    </div>
  );
}
