// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { authApi, UserDTO } from "../services/api";

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // In your AuthContext.tsx
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authCheckPerformed = useRef(false);

  useEffect(() => {
    if (authCheckPerformed.current) return;

    const checkAuthStatus = async () => {
      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // User is not authenticated - this is not an error state
        setUser(null);
      } finally {
        setLoading(false);
        authCheckPerformed.current = true;
      }
    };

    checkAuthStatus();
  }, []);
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authApi.login({ userName: username, password });
      setUser(userData);
    } catch (error) {
      setError("Invalid username or password");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Compute isAuthenticated and isAdmin from the user object
  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes("Admin") ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
