import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/api/auth";
import type { Profile } from "@/types";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    try {
      const p = await getProfile(userId);
      setProfile(p as Profile);
    } catch {
      setProfile(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return;
        setSession(s);
        if (s?.user?.id) {
          fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signOut: handleSignOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
