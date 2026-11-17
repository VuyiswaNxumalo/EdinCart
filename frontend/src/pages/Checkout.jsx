import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { money } from "../format";

export default function Checkout() {
  const { user, ready } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (cart.items.length === 0) {
    return (
      <p className="text-gray-600">
        Your cart is empty.{" "}
        <Link to="/" className="font-medium underline">
          Keep shopping
        </Link>
      </p>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const order = await api("/orders/checkout/", {
        method: "POST",
        auth: true,
        body: { shipping_address: address },
      });
      navigate(`/orders/${order.id}/pay`);
      refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={onSubmit} className="rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-bold">Shipping details</h1>
        {error && (
          <p className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <label className="mb-1 block text-sm font-medium">Delivery address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={4}
          placeholder="Street, suburb, city, postal code"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          disabled={busy}
          className="w-full rounded bg-gray-900 px-3 py-2 font-medium text-white disabled:bg-gray-400"
        >
          {busy ? "Placing order..." : "Place order and continue to payment"}
        </button>
      </form>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Order summary</h2>
        <ul className="mb-4 divide-y">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.quantity} x {item.product_name}
              </span>
              <span>{money(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <p className="text-lg font-bold">Total: {money(cart.total)}</p>
      </div>
    </div>
  );
}
