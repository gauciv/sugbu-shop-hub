import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mounted) return;
        setSession(s);

        if (event === "PASSWORD_RECOVERY") {
          navigate("/reset-password");
        }

        if (event === "SIGNED_IN") {
          const hash = window.location.hash;
          if (hash.includes("type=signup")) {
            navigate("/email-confirmed");
          }
        }

        if (s?.user?.id) {
          await fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }

        if (mounted) setLoading(false);
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
