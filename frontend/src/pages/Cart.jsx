import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { money } from "../format";

export default function Cart() {
  const { user, ready } = useAuth();
  const { cart, updateItem, removeItem } = useCart();
  const [error, setError] = useState("");

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  async function change(item, quantity) {
    setError("");
    try {
      if (quantity < 1) await removeItem(item.id);
      else await updateItem(item.id, quantity);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}

      {cart.items.length === 0 ? (
        <p className="text-gray-600">
          Your cart is empty.{" "}
          <Link to="/" className="font-medium underline">
            Keep shopping
          </Link>
        </p>
      ) : (
        <>
          <ul className="divide-y rounded-lg bg-white shadow">
            {cart.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-sm text-gray-500">{money(item.unit_price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => change(item, item.quantity - 1)}
                    className="h-8 w-8 rounded border border-gray-300"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => change(item, item.quantity + 1)}
                    className="h-8 w-8 rounded border border-gray-300"
                  >
                    +
                  </button>
                </div>
                <p className="w-28 text-right font-medium">{money(item.subtotal)}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-4 shadow">
            <p className="text-lg font-bold">Total: {money(cart.total)}</p>
            <Link
              to="/checkout"
              className="rounded bg-gray-900 px-4 py-2 font-medium text-white"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
