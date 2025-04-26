// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { authApi, UserDTO, GuestUserInfo } from "../services/api";

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isGuest: boolean;
  createGuestSession: (email: string, phone: string) => Promise<void>;
  guestInfo: GuestUserInfo | null;
  continueAsGuest: (info: GuestUserInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestUserInfo | null>(null);
  const authCheckPerformed = useRef(false);

  useEffect(() => {
    if (authCheckPerformed.current) return;

    const checkAuthStatus = async () => {
      try {
        // Check if we have a session cookie before making the API call
        const cookies = document.cookie.split(";");
        const hasAuthCookie = cookies.some(
          (cookie) =>
            cookie.trim().startsWith("auth=") ||
            cookie.trim().startsWith(".AspNetCore.Identity.Application=")
        );

        if (!hasAuthCookie) {
          setUser(null);
          setLoading(false);
          authCheckPerformed.current = true;
          return;
        }

        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        // Only log the error if it's not a 401
        if (error?.response?.status !== 401) {
          console.error("Auth check failed:", error);
        }
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
      const userData = await authApi.login({
        UserName: username,
        Password: password,
      });
      setUser(userData);
      authCheckPerformed.current = true;
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
      setIsGuest(false);
      setGuestInfo(null);
      // Clear any auth cookies
      document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        ".AspNetCore.Identity.Application=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const createGuestSession = async (email: string, phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authApi.createGuestUser({
        email,
        phoneNumber: phone,
      });
      setUser(userData);
      setIsGuest(true);
      setGuestInfo({ email, phoneNumber: phone });
    } catch (error) {
      setError("Failed to create guest session");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = (info: GuestUserInfo) => {
    setGuestInfo(info);
  };

  // Compute isAuthenticated and isAdmin from the user object
  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes("Admin") ?? false;
  const isManager = user?.roles?.includes("Manager") ?? false;

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
        isManager,
        isGuest,
        createGuestSession,
        guestInfo,
        continueAsGuest,
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
