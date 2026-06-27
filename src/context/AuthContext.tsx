import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getUserByEmail, setSession, clearSession, getSession } from "@/lib/db";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const users = JSON.parse(localStorage.getItem("ley1581_usuarios") || "[]") as User[];
      const found = users.find((u) => u.id === session.userId);
      if (found) {
        setUser(found);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const found = getUserByEmail(email);
    if (!found) {
      return { success: false, error: "Usuario no encontrado" };
    }
    if (found.password !== password) {
      return { success: false, error: "Contraseña incorrecta" };
    }
    setUser(found);
    setSession(found.id, found.role);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
