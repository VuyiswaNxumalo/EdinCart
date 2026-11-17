import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { money } from "../format";
import StatusBadge from "../components/StatusBadge";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user, ready } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api(`/orders/${id}/`, { auth: true })
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [id, user]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (error) return <p className="text-red-700">{error}</p>;
  if (!order) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      {location.state?.paid && (
        <p className="mb-4 rounded bg-green-100 px-3 py-2 text-green-800">
          Payment successful. Thank you for your order!
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <ul className="divide-y rounded-lg bg-white shadow">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between p-4">
            <span>
              {item.quantity} x {item.product_name}
              <span className="ml-2 text-sm text-gray-500">
                ({money(item.unit_price)} each)
              </span>
            </span>
            <span className="font-medium">{money(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-white p-4 shadow">
        <p className="text-lg font-bold">Total: {money(order.total)}</p>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Ship to:</span> {order.shipping_address}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Placed:</span>{" "}
          {new Date(order.created_at).toLocaleString("en-ZA")}
        </p>
        {order.payment_reference && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Payment reference:</span>{" "}
            {order.payment_reference}
          </p>
        )}
        {order.status === "pending" && (
          <Link
            to={`/orders/${order.id}/pay`}
            className="mt-4 inline-block rounded bg-gray-900 px-4 py-2 font-medium text-white"
          >
            Pay now
          </Link>
        )}
      </div>

      <p className="mt-4">
        <Link to="/orders" className="text-sm font-medium underline">
          Back to all orders
        </Link>
      </p>
    </div>
  );
}
