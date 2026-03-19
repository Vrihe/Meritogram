import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({ email: 'test@test.com', full_name: 'Test User', id: '1' } as any);
  const [token, setToken] = useState<string | null>('fake-token');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /*
    if (token) {
      authService.getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    */
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; full_name: string }) => {
    const res = await authService.register(data);
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
