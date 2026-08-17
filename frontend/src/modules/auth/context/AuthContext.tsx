import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../api/tokenStorage";
import { setUnauthorizedHandler } from "../api/httpClient";
import {
  unwrapApiResult,
  type LoginCredentials,
  type PublicUserDetails,
  type RegisterCredentials,
} from "../types/authTypes";

interface AuthContextValue {
  user: PublicUserDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<PublicUserDetails>;
  register: (credentials: RegisterCredentials) => Promise<PublicUserDetails>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(user: PublicUserDetails, accessToken: string) {
  tokenStorage.set(accessToken);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const result = await authApi.refresh();
        const data = unwrapApiResult(result);
        setUser(applySession(data.user, data.accessToken));
        return data.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(refreshSession);
  }, [refreshSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const token = await refreshSession();
        if (cancelled || !token) return;

        const result = await authApi.me();
        if (!cancelled) {
          setUser(unwrapApiResult(result).user);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<PublicUserDetails> => {
      const data = unwrapApiResult(await authApi.login(credentials));
      setUser(applySession(data.user, data.accessToken));
      return data.user;
    },
    [],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<PublicUserDetails> => {
      const data = unwrapApiResult(await authApi.register(credentials));
      setUser(applySession(data.user, data.accessToken));
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
