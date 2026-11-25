import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { syncVaultToBackend, saveUserVault } from '../utils/dataVault';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LocalAccountRecord {
  email: string;
  password: string;
  fullName: string;
  savedAt: number;
}

const LOCAL_ACCOUNTS_KEY = 'edupath_local_accounts';

const getSavedAccounts = (): Record<string, LocalAccountRecord> => {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalAccount = (email: string, password: string, fullName: string) => {
  try {
    const accounts = getSavedAccounts();
    accounts[email.toLowerCase()] = {
      email: email.toLowerCase(),
      password,
      fullName,
      savedAt: Date.now()
    };
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Could not save local account backup:', err);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('edupath_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('edupath_token')) {
        const me = await api.getMe();
        setUser(me);
        // Silently ensure vault is synced to backend
        syncVaultToBackend(me.email).catch(() => {});
      }
    } catch {
      // If serverless container recycled /tmp database, recover seamlessly from local account vault
      const accounts = getSavedAccounts();
      const accountKeys = Object.keys(accounts);
      if (accountKeys.length > 0) {
        // Pick the most recently active account
        const sorted = accountKeys
          .map(k => accounts[k])
          .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        const latestAcc = sorted[0];

        if (latestAcc && latestAcc.email && latestAcc.password) {
          try {
            console.info(`[AuthContext] Auto-restoring session for ${latestAcc.email} after container cold-start...`);
            let regRes;
            try {
              regRes = await api.login({ email: latestAcc.email, password: latestAcc.password });
            } catch {
              regRes = await api.register({
                email: latestAcc.email,
                password: latestAcc.password,
                full_name: latestAcc.fullName || 'Explorer'
              });
            }
            localStorage.setItem('edupath_token', regRes.access_token);
            setToken(regRes.access_token);
            setUser(regRes.user);
            await syncVaultToBackend(latestAcc.email);
            return;
          } catch (autoErr) {
            console.warn('[AuthContext] Session auto-restoration failed:', autoErr);
          }
        }
      }

      localStorage.removeItem('edupath_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const res = await api.login({ email: cleanEmail, password: cleanPass });
      localStorage.setItem('edupath_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      saveLocalAccount(cleanEmail, cleanPass, res.user.full_name || 'Explorer');
      saveUserVault(cleanEmail, { fullName: res.user.full_name });
      // Restore any cached profile data to backend
      await syncVaultToBackend(cleanEmail);
    } catch (err: any) {
      // If serverless container restarted or wiped /tmp DB, check local account cache to auto-restore
      const accounts = getSavedAccounts();
      const localAcc = accounts[cleanEmail];
      if (localAcc && localAcc.password === cleanPass) {
        try {
          const regRes = await api.register({
            email: cleanEmail,
            password: cleanPass,
            full_name: localAcc.fullName || 'Explorer'
          });
          localStorage.setItem('edupath_token', regRes.access_token);
          setToken(regRes.access_token);
          setUser(regRes.user);
          saveUserVault(cleanEmail, { fullName: localAcc.fullName });
          await syncVaultToBackend(cleanEmail);
          return;
        } catch (autoRegErr) {
          console.warn('Auto-restore failed:', autoRegErr);
        }
      }
      throw err;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanName = name.trim();

    const res = await api.register({ email: cleanEmail, password: cleanPass, full_name: cleanName });
    localStorage.setItem('edupath_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    saveLocalAccount(cleanEmail, cleanPass, cleanName);
    saveUserVault(cleanEmail, { fullName: cleanName });
    await syncVaultToBackend(cleanEmail);
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginDemo();
      localStorage.setItem('edupath_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('edupath_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginDemo, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
