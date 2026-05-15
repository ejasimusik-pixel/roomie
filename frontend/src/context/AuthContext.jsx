import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

/**
 * Last-resort projection from auth.users.user_metadata. Used only when the
 * `profiles` row hasn't been provisioned yet (e.g. before the SQL migration
 * has been executed) so the UI can still route the user to the right shell.
 */
function buildProfileFromUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: meta.full_name || user.email?.split("@")[0] || "Roomie",
    role: meta.role || "client",
    salon_id: meta.salon_id ?? null,
    avatar_url: meta.avatar_url ?? null,
  };
}

/**
 * Reads the canonical profile from `public.profiles`. Falls back to a
 * metadata-derived stub if the row doesn't exist yet or the query fails.
 * Note: we intentionally do NOT race the query against a timeout here —
 * the metadata-based fallback misses post-onboarding salon_id and we'd rather
 * wait an extra second than mis-route a returning salon_owner. The outer
 * AuthContext failsafe still guarantees the UI never hangs.
 */
async function fetchProfile(user) {
  if (!user) return null;
  if (!isSupabaseConfigured) {
    return buildProfileFromUser(user);
  }
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, salon_id, full_name, email, avatar_url, locale")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.warn(
        "[Roomie] profiles SELECT failed, falling back:",
        error.message
      );
      return buildProfileFromUser(user);
    }
    return data || buildProfileFromUser(user);
  } catch (err) {
    console.warn("[Roomie] profiles fetch threw, falling back:", err);
    return buildProfileFromUser(user);
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let latestSession = null;
    let resolved = false;

    // Unconditional safety: release the splash after 3.5s. The metadata-based
    // fallback ensures route guards have enough info to make a decision even
    // before the canonical profile lands.
    const failsafe = setTimeout(() => {
      if (!isMounted || resolved) return;
      setLoading(false);
      if (latestSession?.user) {
        setProfile((prev) => prev || buildProfileFromUser(latestSession.user));
      }
    }, 3500);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        resolved = true;
        latestSession = data?.session || null;
        setSession(latestSession);
        const p = await fetchProfile(latestSession?.user);
        if (!isMounted) return;
        setProfile(p);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[Roomie] getSession failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      latestSession = newSession;
      setSession(newSession);
      const p = await fetchProfile(newSession?.user);
      if (!isMounted) return;
      setProfile(p);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = useCallback(async (email, password, metadata = {}) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "client",
          salon_id: null,
          ...metadata,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    const p = await fetchProfile(session?.user);
    setProfile(p);
    return p;
  }, [session]);

  /** Synchronously merge fields into the in-memory profile. Used after RPCs
   * (e.g. create_my_salon) that we know already mutated the DB row so route
   * guards can navigate immediately without waiting for a fetch round-trip. */
  const applyLocalProfile = useCallback((patch) => {
    setProfile((prev) => ({ ...(prev || {}), ...(patch || {}) }));
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      loading,
      isAuthenticated: !!session,
      role: profile?.role || null,
      salonId: profile?.salon_id || null,
      isDemoBackend: !isSupabaseConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshProfile,
      applyLocalProfile,
    }),
    [session, profile, loading, signUp, signIn, signInWithGoogle, signOut, refreshProfile, applyLocalProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
