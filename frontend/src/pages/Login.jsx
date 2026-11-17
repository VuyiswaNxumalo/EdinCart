import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-bold">Log in</h1>
      {error && <p className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      <label className="mb-1 block text-sm font-medium">Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="mb-3 w-full rounded border border-gray-300 px-3 py-2"
      />
      <label className="mb-1 block text-sm font-medium">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
      />
      <button
        disabled={busy}
        className="w-full rounded bg-gray-900 px-3 py-2 font-medium text-white disabled:bg-gray-400"
      >
        {busy ? "Logging in..." : "Log in"}
      </button>
      <p className="mt-4 text-sm text-gray-600">
        No account?{" "}
        <Link to="/register" className="font-medium underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
