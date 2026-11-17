import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { money } from "../format";

export default function Pay() {
  const { id } = useParams();
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [card, setCard] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    api(`/orders/${id}/`, { auth: true })
      .then(setOrder)
      .catch((err) => setLoadError(err.message));
  }, [id, user]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (loadError) return <p className="text-red-700">{loadError}</p>;
  if (!order) return <p className="text-gray-500">Loading...</p>;

  if (order.status !== "pending") {
    return (
      <p className="text-gray-600">
        This order isn't awaiting payment.{" "}
        <Link to={`/orders/${order.id}`} className="font-medium underline">
          View order
        </Link>
      </p>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/orders/${id}/pay/`, {
        method: "POST",
        auth: true,
        body: {
          card_number: card,
          exp_month: Number(month),
          exp_year: Number(year),
          cvc,
        },
      });
      navigate(`/orders/${id}`, { state: { paid: true } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-1 text-xl font-bold">Payment</h1>
      <p className="mb-4 text-gray-600">
        Order #{order.id} &middot; {money(order.total)}
      </p>

      <div className="mb-4 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
        <strong>Test mode.</strong> No real payments are taken. Use{" "}
        <code>4242 4242 4242 4242</code> to succeed or{" "}
        <code>4000 0000 0000 0002</code> to be declined, with any future expiry
        and any 3-digit CVC. Never enter a real card number.
      </div>

      {error && (
        <p className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <label className="mb-1 block text-sm font-medium">Card number</label>
      <input
        value={card}
        onChange={(e) => setCard(e.target.value)}
        inputMode="numeric"
        placeholder="4242 4242 4242 4242"
        required
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2"
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Month</label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="12"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Year</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2030"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">CVC</label>
          <input
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            placeholder="123"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <button
        disabled={busy}
        className="w-full rounded bg-gray-900 px-3 py-2 font-medium text-white disabled:bg-gray-400"
      >
        {busy ? "Processing..." : `Pay ${money(order.total)}`}
      </button>
    </form>
  );
}
