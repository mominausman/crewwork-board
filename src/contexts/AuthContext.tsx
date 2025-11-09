import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleErrorSilent } from "@/lib/errorHandler";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      handleErrorSilent(error, "Fetch user role");
      setUserRole(null);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string) => {
    // Check if email is allowed
    try {
      const { data, error: checkError } = await supabase.rpc('is_email_allowed', { 
        user_email: email.toLowerCase() 
      });

      if (checkError) throw checkError;

      if (!data) {
        toast.error("Access restricted. Please contact your Admin for permission to join the workspace.", {
          duration: 5000,
        });
        return { error: new Error("Email not allowed") };
      }
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error("Unable to verify email access. Please try again.");
      return { error: error as Error };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! You can now sign in.");
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Check if email is allowed
    try {
      const { data, error: checkError } = await supabase.rpc('is_email_allowed', { 
        user_email: email.toLowerCase() 
      });

      if (checkError) throw checkError;

      if (!data) {
        toast.error("Access restricted. Please contact your Admin for permission to join the workspace.", {
          duration: 5000,
        });
        return { error: new Error("Email not allowed") };
      }
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error("Unable to verify email access. Please try again.");
      return { error: error as Error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully!");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
