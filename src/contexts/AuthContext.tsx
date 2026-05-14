import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthContextType, AuthResponse } from '../types/auth';
import { SessionManager } from '../utils/sessionManager';
import { API_BASE } from '../api/config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

function toUser(raw: AuthResponse['user']): User {
  const role = (raw as any).role ?? 'user';
  return {
    id: raw.id,
    email: raw.email,
    name: (raw as any).name ?? raw.username ?? raw.email.split('@')[0],
    username: raw.username,
    role: role as 'admin' | 'user',
    plan: ((raw as any).plan ?? 'free') as 'free' | 'premium',
    aiUsageCount: (raw as any).aiUsageCount,
    aiUsageResetAt: (raw as any).aiUsageResetAt,
  };
}

/**
 * Verify stored session against the backend.
 * Returns the user if still active, null if deactivated/deleted/expired.
 */
async function verifySession(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      // Account deactivated or token invalid — clear immediately
      const data = await res.json().catch(() => ({}));
      if (data?.error === 'ACCOUNT_DEACTIVATED') {
        sessionStorage.setItem('account_deactivated_msg',
          data.message || 'Your account has been deactivated.');
      }
      SessionManager.clearSession();
      return null;
    }

    if (!res.ok) {
      // Server error (500, 502, etc.) — keep local session, don't force logout
      return SessionManager.getUser();
    }

    const raw = await res.json();
    // Normalize — same as toUser() — ensures name is always populated
    const user: User = {
      id: raw.id ?? raw._id,
      email: raw.email,
      name: raw.name ?? raw.username ?? raw.email?.split('@')[0] ?? 'User',
      username: raw.username,
      role: raw.role ?? 'user',
      plan: raw.plan ?? 'free',
      isActive: raw.isActive !== false,
      aiUsageCount: raw.aiUsageCount ?? 0,
      aiUsageResetAt: raw.aiUsageResetAt ?? new Date().toISOString().slice(0, 10),
    };
    return user;
  } catch {
    // Network offline — keep local session, don't force logout
    return SessionManager.getUser();
  }
}


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = SessionManager.getUser();
      let token = SessionManager.getToken();

      if (!stored) {
        setIsLoading(false);
        return;
      }

      // If we have a user but no token (e.g. page reload), try to refresh
      if (!token) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            token = data.token;
            SessionManager.setToken(token!);
          } else {
            // Refresh failed, token expired
            SessionManager.clearSession();
            setUser(null);
            setIsLoading(false);
            return;
          }
        } catch {
          // Network error during refresh, assume offline but keep UI
          setUser(stored);
          setIsLoading(false);
          return;
        }
      }

      // Optimistically set user from localStorage so UI doesn't flash
      setUser(stored);

      // Then verify with backend — catches deactivated accounts
      if (token) {
        verifySession(token).then(verified => {
          if (verified) {
            setUser(verified);
            SessionManager.saveSession(verified, token!);
          } else {
            setUser(null);
            SessionManager.clearSession();
          }
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((response: AuthResponse | User, token?: string) => {
    let u: User;
    let t: string;

    if ('token' in response && 'user' in response) {
      u = toUser((response as AuthResponse).user);
      t = (response as AuthResponse).token;
    } else {
      u = response as User;
      t = token ?? SessionManager.getToken() ?? '';
    }

    setUser(u);
    SessionManager.saveSession(u, t);
  }, []);

  const logout = useCallback(() => {
    // Optimistically clear local state
    setUser(null);
    SessionManager.clearSession();
    // Hit backend to clear HttpOnly cookie
    fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      SessionManager.saveSession(updated, SessionManager.getToken() ?? '');
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
