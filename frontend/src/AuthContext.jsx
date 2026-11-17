import { createContext, useContext, useEffect, useState } from "react";
import { api, tokens } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokens.access && !tokens.refresh) {
      setReady(true);
      return;
    }
    api("/auth/me/", { auth: true })
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setReady(true));
  }, []);

  async function login(username, password) {
    const data = await api("/auth/login/", {
      method: "POST",
      body: { username, password },
    });
    tokens.set(data.access, data.refresh);
    setUser(await api("/auth/me/", { auth: true }));
  }

  async function register(username, email, password) {
    await api("/auth/register/", {
      method: "POST",
      body: { username, email, password },
    });
    await login(username, password);
  }

  function logout() {
    tokens.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
