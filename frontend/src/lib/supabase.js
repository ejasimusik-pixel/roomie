/**
 * Supabase client with graceful demo fallback.
 *
 * If REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are configured,
 * the real Supabase client is used. Otherwise, a localStorage-backed mock
 * client allows the architecture (auth flows, role routing, UI) to be tested
 * before keys are provisioned. The same surface area is exposed in both modes
 * so application code never branches on the auth backend.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ============================================================
//                    DEMO (mock) BACKEND
// ============================================================
const DEMO_USERS_KEY = "roomie.demo.users";
const DEMO_SESSION_KEY = "roomie.demo.session";

function loadDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}
function loadDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
function saveDemoSession(session) {
  if (session) {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }
}

function seedDemoUsersIfEmpty() {
  const users = loadDemoUsers();
  if (users.length > 0) return;
  saveDemoUsers([
    {
      id: "demo-client-1",
      email: "cliente@roomie.demo",
      password: "Roomie2026!",
      user_metadata: {
        full_name: "Sofía Martínez",
        role: "client",
        salon_id: null,
        avatar_url: null,
      },
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-owner-1",
      email: "salon@roomie.demo",
      password: "Roomie2026!",
      user_metadata: {
        full_name: "Valentina Herrera",
        role: "salon_owner",
        salon_id: "salon-aurora",
        avatar_url: null,
      },
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-admin-1",
      email: "admin@roomie.demo",
      password: "Roomie2026!",
      user_metadata: {
        full_name: "Roomie Admin",
        role: "admin",
        salon_id: null,
        avatar_url: null,
      },
      created_at: new Date().toISOString(),
    },
  ]);
}

const authListeners = new Set();
function emitAuthChange(event, session) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      /* ignore */
    }
  });
}

function buildSession(user) {
  return {
    access_token: `demo-token-${user.id}`,
    refresh_token: `demo-refresh-${user.id}`,
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
      app_metadata: { provider: "email" },
      created_at: user.created_at,
    },
  };
}

function buildDemoClient() {
  seedDemoUsersIfEmpty();

  return {
    __isDemo: true,
    auth: {
      async getSession() {
        return { data: { session: loadDemoSession() }, error: null };
      },
      async getUser() {
        const s = loadDemoSession();
        return { data: { user: s?.user || null }, error: null };
      },
      onAuthStateChange(callback) {
        authListeners.add(callback);
        // Replay current session on subscribe (mirrors supabase behavior)
        Promise.resolve().then(() => {
          const s = loadDemoSession();
          callback(s ? "INITIAL_SESSION" : "INITIAL_SESSION", s);
        });
        return {
          data: {
            subscription: {
              unsubscribe: () => authListeners.delete(callback),
            },
          },
        };
      },
      async signUp({ email, password, options }) {
        const users = loadDemoUsers();
        if (users.some((u) => u.email === email)) {
          return {
            data: null,
            error: { message: "Este correo ya está registrado" },
          };
        }
        const newUser = {
          id: `demo-${Math.random().toString(36).slice(2, 10)}`,
          email,
          password,
          user_metadata: options?.data || { role: "client", salon_id: null },
          created_at: new Date().toISOString(),
        };
        users.push(newUser);
        saveDemoUsers(users);
        const session = buildSession(newUser);
        saveDemoSession(session);
        emitAuthChange("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const users = loadDemoUsers();
        const user = users.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) {
          return {
            data: null,
            error: { message: "Credenciales incorrectas" },
          };
        }
        const session = buildSession(user);
        saveDemoSession(session);
        emitAuthChange("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },
      async signInWithOAuth({ provider }) {
        // In demo mode, auto-log in as a client to showcase the flow
        const users = loadDemoUsers();
        const demoUser = users.find((u) => u.email === "cliente@roomie.demo");
        if (demoUser) {
          const session = buildSession(demoUser);
          saveDemoSession(session);
          emitAuthChange("SIGNED_IN", session);
        }
        return {
          data: { provider, url: window.location.origin + "/auth/callback" },
          error: null,
        };
      },
      async signOut() {
        saveDemoSession(null);
        emitAuthChange("SIGNED_OUT", null);
        return { error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
      async updateUser({ data }) {
        const session = loadDemoSession();
        if (!session) return { data: null, error: { message: "No session" } };
        const users = loadDemoUsers();
        const idx = users.findIndex((u) => u.id === session.user.id);
        if (idx === -1) return { data: null, error: { message: "Not found" } };
        users[idx].user_metadata = { ...users[idx].user_metadata, ...data };
        saveDemoUsers(users);
        session.user.user_metadata = users[idx].user_metadata;
        saveDemoSession(session);
        emitAuthChange("USER_UPDATED", session);
        return { data: { user: session.user }, error: null };
      },
    },
    from() {
      // Minimal placeholder; the data layer is intentionally not implemented yet
      return {
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
      };
    },
  };
}

// ============================================================
//                  EXPORTED CLIENT
// ============================================================
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : buildDemoClient();
