import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import brand from '@/brand/brand.config';
import { CURRENT_USER } from '@/data/people';

/**
 * Demo authentication.
 *
 * Unlike the reference, this does NOT clear storage as an import-time side
 * effect — a module that mutates localStorage when it is merely imported is a
 * surprise.
 *
 * The session is held in sessionStorage rather than memory so a refresh (or
 * opening a deep link in a new tab) doesn't dump the demo back at the login
 * screen. sessionStorage, not localStorage: the session should still end when
 * the browser tab closes.
 */

const SESSION_KEY = 'fi911.session';

const readSession = () => {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (user) => {
  try {
    if (user) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — the session simply stays in memory */
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const signIn = useCallback(async (username, password) => {
    setBusy(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 320));
    setBusy(false);

    const ok = username === brand.demoCredentials.username && password === brand.demoCredentials.password;
    if (!ok) {
      setError('Those credentials were not recognized.');
      return false;
    }
    const session = { ...CURRENT_USER };
    writeSession(session);
    setUser(session);
    return true;
  }, []);

  const signOut = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, error, busy, signIn, signOut, isAuthenticated: Boolean(user) }),
    [user, error, busy, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthProvider;
