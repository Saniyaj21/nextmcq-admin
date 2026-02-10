'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: Pick<User, '_id' | 'name' | 'email' | 'role' | 'profileImage'> | null;
  token: string | null;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (stored) {
      setToken(stored);
      api.get('/verify')
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    await authApi.post('/auth/send-otp', { email });
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await authApi.post('/auth/verify-otp', { email, otp });
    const jwt = res.data.data.token;

    // Store token temporarily for the admin verify call
    localStorage.setItem('admin_token', jwt);
    setToken(jwt);

    // Verify admin role
    try {
      const adminRes = await api.get('/verify');
      setUser(adminRes.data.user);
      router.push('/');
    } catch (err: unknown) {
      localStorage.removeItem('admin_token');
      setToken(null);
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const serverMsg = axiosErr?.response?.data?.message || 'Admin role required';
      console.log('[ADMIN AUTH] Verify failed:', serverMsg);
      throw new Error('Access denied. This account does not have admin privileges.');
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
