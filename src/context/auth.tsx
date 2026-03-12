import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/api/auth";
import { toast } from "sonner";
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
  const profileIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await getProfile(userId);
      if ((p as Profile).is_suspended) {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        profileIdRef.current = null;
        toast.error("Your account has been suspended. Please contact support for assistance.");
        return;
      }
      const incoming = p as Profile;
      // Only update profile state if the user actually changed — avoids
      // unnecessary re-renders on token refreshes where the data is identical.
      if (profileIdRef.current !== incoming.id) {
        profileIdRef.current = incoming.id;
        setProfile(incoming);
      }
    } catch {
      profileIdRef.current = null;
      setProfile(null);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    profileIdRef.current = null;
  }, []);

  const refreshProfile = useCallback(async () => {
    const uid = profileIdRef.current;
    if (uid) {
      // Force a fresh fetch by resetting the ref so setProfile always fires
      profileIdRef.current = null;
      await fetchProfile(uid);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
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

        // Fetch the profile outside the synchronous callback to avoid
        // deadlocking session initialization — the Supabase client waits
        // for this callback to return before the session is "ready", so
        // any await on a Supabase query inside it would hang forever.
        if (s?.user?.id) {
          fetchProfile(s.user.id).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          profileIdRef.current = null;
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, fetchProfile]);

  const value = useMemo(
    () => ({ session, profile, loading, signOut: handleSignOut, refreshProfile }),
    [session, profile, loading, handleSignOut, refreshProfile],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
