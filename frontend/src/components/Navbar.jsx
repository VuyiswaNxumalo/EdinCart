import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-bold">
          EdinCart
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/cart" className="font-medium hover:underline">
            Cart ({count})
          </Link>
          {user ? (
            <>
              <span className="text-gray-600">Hi, {user.username}</span>
              <button onClick={logout} className="font-medium hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium hover:underline">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-gray-900 px-3 py-1.5 font-medium text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
