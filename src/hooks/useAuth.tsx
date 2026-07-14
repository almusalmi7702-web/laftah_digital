import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  // authLoading: resolving the Supabase session itself
  authLoading: boolean;
  // adminChecked: the admin_users lookup has finished (true only after a definite result)
  adminChecked: boolean;
  loading: boolean; // authLoading || (has user && !adminChecked)
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TIMEOUT_MS = 10000;

const ADMIN_CACHE_KEY = 'laftah_admin_verified_user_id';
const ADMIN_CACHE_AT_KEY = 'laftah_admin_verified_at';
// Cache validity window to reduce flicker while re-verifying in background.
const ADMIN_CACHE_TTL_MS = 5 * 60 * 1000;

const withTimeout = async <T,>(
  promise: PromiseLike<T>,
  ms: number = AUTH_TIMEOUT_MS
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.')),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const getAdminCache = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const cachedId = window.localStorage.getItem(ADMIN_CACHE_KEY);
    const cachedAt = Number(window.localStorage.getItem(ADMIN_CACHE_AT_KEY));
    if (cachedId === userId && Number.isFinite(cachedAt)) {
      return Date.now() - cachedAt < ADMIN_CACHE_TTL_MS;
    }
  } catch {
    // ignore
  }
  return false;
};

const setAdminCache = (userId: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADMIN_CACHE_KEY, userId);
    window.localStorage.setItem(ADMIN_CACHE_AT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
};

const clearAdminCache = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ADMIN_CACHE_KEY);
    window.localStorage.removeItem(ADMIN_CACHE_AT_KEY);
  } catch {
    // ignore
  }
};

// Map Supabase auth errors to clear Arabic messages.
const translateAuthError = (error: unknown): string => {
  const message = String((error as { message?: string })?.message || '').toLowerCase();
  if (message.includes('invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }
  if (message.includes('email not confirmed')) {
    return 'يرجى تأكيد البريد الإلكتروني أولًا.';
  }
  if (
    message.includes('timeout') ||
    message.includes('انتهت مهلة') ||
    message.includes('timed out')
  ) {
    return 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
  }
  if (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('fetcherror') ||
    message.includes('network request failed')
  ) {
    return 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
  }
  if (
    message.includes('too many requests') ||
    message.includes('rate limit')
  ) {
    return 'تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.';
  }
  return 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.';
};

const checkAdminUser = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
    );
    if (error) {
      console.error('Admin check error:', error);
      return false;
    }
    return Boolean(data);
  } catch (error) {
    console.error('Admin check failed:', error);
    throw error;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);

  const resolveAdmin = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }

    // Optimistic cache to reduce flicker; re-verify in background.
    const cached = getAdminCache(currentSession.user.id);
    if (cached) {
      setIsAdmin(true);
      setAdminChecked(true);
    } else {
      setAdminChecked(false);
    }

    try {
      const admin = await checkAdminUser(currentSession.user.id);
      setIsAdmin(admin);
      setAdminChecked(true);
      if (admin) setAdminCache(currentSession.user.id);
      else clearAdminCache();
    } catch (error) {
      // Network/timeout: do NOT treat as "not admin". Keep cached state if any.
      console.error('Admin resolve error:', error);
      setAdminChecked(true);
      if (!cached) setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      setAuthLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await withTimeout(supabase.auth.getSession());

        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setAdminChecked(true);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        await resolveAdmin(session);
      } catch (error) {
        console.error('Initial auth loading failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setAdminChecked(true);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      setAuthLoading(true);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      // Resolve admin outside of the synchronous onAuthStateChange callback body
      // to avoid Supabase deadlock warnings.
      resolveAdmin(currentSession).finally(() => {
        if (mounted) setAuthLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loading = authLoading || (user !== null && !adminChecked);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password })
      );
      if (error) return { error: translateAuthError(error) };
      return { error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { error: translateAuthError(error) };
    }
  };

  const signOut = async () => {
    try {
      await withTimeout(supabase.auth.signOut());
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAdminChecked(true);
      clearAdminCache();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        authLoading,
        adminChecked,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
