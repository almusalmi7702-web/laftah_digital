import { useState, useEffect, createContext, useContext, ReactNode } from  react ;
import { supabase } from  ../lib/supabase ;
import type { User, Session } from  @supabase/supabase-js ;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TIMEOUT_MS = 10000;

const withTimeout = async <T,>(
  promise: PromiseLike<T>,
  ms: number = AUTH_TIMEOUT_MS
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error( انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى. ));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const checkAdminUser = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from( admin_users )
        .select( id )
        .eq( id , userId)
        .maybeSingle()
    );

    if (error) {
      console.error( Admin check error: , error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error( Admin check failed: , error);
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applySession = async (currentSession: Session | null) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (!currentSession?.user) {
        setIsAdmin(false);
        return;
      }

      const admin = await checkAdminUser(currentSession.user.id);
      if (mounted) {
        setIsAdmin(admin);
      }
    };

    const getSession = async () => {
      if (mounted) setLoading(true);

      try {
        const {
          data: { session },
          error,
        } = await withTimeout(supabase.auth.getSession());

        if (error) {
          console.error( Session error: , error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
          return;
        }

        await applySession(session);
      } catch (error) {
        console.error( Initial auth loading failed: , error);

        if (mounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;

      setLoading(true);

      try {
        await applySession(currentSession);
      } catch (error) {
        console.error( Auth state change failed: , error);

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password })
      );

      if (error) return { error: error.message };
      return { error: null };
    } catch (error: any) {
      console.error( Sign in failed: , error);
      return { error: error.message ||  حدث خطأ أثناء تسجيل الدخول  };
    }
  };

  const signOut = async () => {
    try {
      await withTimeout(supabase.auth.signOut());
    } catch (error) {
      console.error( Sign out failed: , error);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error( useAuth must be used within AuthProvider );
  }

  return context;
};
