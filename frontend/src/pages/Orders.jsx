import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { money } from "../format";
import StatusBadge from "../components/StatusBadge";

export default function Orders() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api("/orders/", { auth: true })
      .then((data) => setOrders(data.results))
      .catch((err) => setError(err.message));
  }, [user]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your orders</h1>
      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">{error}</p>}
      {!orders && !error && <p className="text-gray-500">Loading...</p>}
      {orders && orders.length === 0 && (
        <p className="text-gray-600">
          No orders yet.{" "}
          <Link to="/" className="font-medium underline">
            Start shopping
          </Link>
        </p>
      )}
      {orders && orders.length > 0 && (
        <ul className="divide-y rounded-lg bg-white shadow">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to={`/orders/${o.id}`}
                className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50"
              >
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">Order #{o.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(o.created_at).toLocaleString("en-ZA")} &middot;{" "}
                    {o.items.length} item{o.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <StatusBadge status={o.status} />
                <p className="w-28 text-right font-medium">{money(o.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
