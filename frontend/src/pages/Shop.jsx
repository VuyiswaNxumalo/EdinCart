import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { money } from "../format";

export default function Shop() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ordering, setOrdering] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api("/categories/")
      .then((data) => setCategories(data.results))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category__slug", category);
    if (ordering) params.set("ordering", ordering);

    setLoading(true);
    const timer = setTimeout(() => {
      api(`/products/?${params}`)
        .then((data) => {
          if (cancelled) return;
          setProducts(data.results);
          setError("");
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, category, ordering]);

  function flash(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  }

  async function handleAdd(product) {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addItem(product.id, 1);
      flash(`${product.name} added to your cart.`);
    } catch (err) {
      flash(err.message);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-56 flex-1 rounded border border-gray-300 bg-white px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2"
        >
          <option value="">Newest</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {notice && (
        <p className="mb-4 rounded bg-green-100 px-3 py-2 text-green-800">{notice}</p>
      )}
      {error && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-red-700">
          Could not load products: {error}
        </p>
      )}
      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500">No products found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <article key={p.id} className="flex flex-col rounded-lg bg-white p-4 shadow">
            <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded bg-gray-100 text-gray-400">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                "No image"
              )}
            </div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {p.category_name}
            </p>
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-lg font-bold">{money(p.price)}</p>
            <p className="mb-3 text-sm text-gray-500">
              {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
            </p>
            <button
              onClick={() => handleAdd(p)}
              disabled={p.stock === 0}
              className="mt-auto rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Add to cart
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
