import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const EMPTY = { items: [], total: "0.00" };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);

  useEffect(() => {
    if (!user) {
      setCart(EMPTY);
      return;
    }
    api("/cart/", { auth: true })
      .then(setCart)
      .catch(() => {});
  }, [user]);

  const count = cart.items.reduce((n, item) => n + item.quantity, 0);

  async function addItem(productId, quantity = 1) {
    setCart(
      await api("/cart/items/", {
        method: "POST",
        auth: true,
        body: { product_id: productId, quantity },
      })
    );
  }

  async function updateItem(id, quantity) {
    setCart(
      await api(`/cart/items/${id}/`, {
        method: "PATCH",
        auth: true,
        body: { quantity },
      })
    );
  }

  async function removeItem(id) {
    setCart(await api(`/cart/items/${id}/`, { method: "DELETE", auth: true }));
  }

  return (
    <CartContext.Provider value={{ cart, count, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
