import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { type User } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables } from "@/integrations/supabase/types";

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    company?: string;
    phone?: string;
    rneFile?: string;
    patenteFile?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
  }>;
  logout: () => Promise<void>;
  updateProfile: (
    data: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isManager: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type DbRole = Enums<"app_role">;
type DbProfile = Tables<"profiles">;

function mapToAppUser(
  authUser: { id: string; email?: string | null; created_at?: string },
  profile: DbProfile | null,
  role: DbRole,
): User {
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    password: "",
    role,
    fullName: profile?.full_name || authUser.email || "Utilisateur",
    company: profile?.company || undefined,
    phone: profile?.phone || undefined,
    rneFile: profile?.rne_file || undefined,
    patenteFile: profile?.patente_file || undefined,
    avatar: profile?.avatar_url || undefined,
    createdAt: (
      profile?.created_at ||
      authUser.created_at ||
      new Date().toISOString()
    ).split("T")[0],
  };
}

async function fetchProfileAndRole(
  userId: string,
): Promise<{ profile: DbProfile | null; role: DbRole }> {
  const [profileResult, roleResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profile = profileResult.data ?? null;
  const role = (roleResult.data?.role as DbRole | undefined) ?? "client";
  return { profile, role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(
    async (
      authUser: {
        id: string;
        email?: string | null;
        created_at?: string;
      } | null,
    ) => {
      if (!authUser) {
        setUser(null);
        return;
      }
      const { profile, role } = await fetchProfileAndRole(authUser.id);
      setUser(mapToAppUser(authUser, profile, role));
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      await loadCurrentUser(data.session?.user ?? null);
      if (mounted) setIsLoading(false);
    };

    void init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void loadCurrentUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadCurrentUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      await loadCurrentUser(data.user ?? null);
      return { success: true };
    },
    [loadCurrentUser],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      company?: string;
      phone?: string;
      rneFile?: string;
      patenteFile?: string;
    }) => {
      const signUpResult = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpResult.error) {
        const isRateLimited =
          signUpResult.error.status === 429 ||
          signUpResult.error.message.toLowerCase().includes("too many");

        if (isRateLimited) {
          const signInAttempt = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (!signInAttempt.error && signInAttempt.data.user) {
            await loadCurrentUser(signInAttempt.data.user);
            return { success: true };
          }

          const signInErrorMessage =
            signInAttempt.error?.message.toLowerCase() ?? "";
          if (
            signInErrorMessage.includes("not confirmed") ||
            signInErrorMessage.includes("email")
          ) {
            return {
              success: true,
              requiresEmailConfirmation: true,
            };
          }

          return {
            success: false,
            error:
              "Trop de tentatives d'inscription. Veuillez patienter 60 secondes puis réessayer.",
          };
        }

        return { success: false, error: signUpResult.error.message };
      }

      const createdUser = signUpResult.data.user;
      if (!createdUser) {
        return { success: true };
      }

      const sessionUser = signUpResult.data.session?.user ?? null;

      if (!sessionUser) {
        return {
          success: true,
          requiresEmailConfirmation: true,
        };
      }

      const [{ error: profileError }, { error: roleError }] = await Promise.all(
        [
          supabase.from("profiles").upsert(
            {
              user_id: createdUser.id,
              full_name: data.fullName,
              company: data.company ?? null,
              phone: data.phone ?? null,
              rne_file: data.rneFile ?? null,
              patente_file: data.patenteFile ?? null,
            },
            { onConflict: "user_id" },
          ),
          supabase.from("user_roles").upsert(
            {
              user_id: createdUser.id,
              role: "client",
            },
            { onConflict: "user_id" },
          ),
        ],
      );

      if (profileError || roleError) {
        return {
          success: false,
          error:
            profileError?.message ||
            roleError?.message ||
            "Erreur lors de la création du profil",
        };
      }

      await loadCurrentUser(sessionUser);
      return { success: true };
    },
    [loadCurrentUser],
  );

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      if (data.email && data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) {
          return { success: false, error: emailError.message };
        }
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          full_name: data.fullName ?? user.fullName,
          company: data.company ?? null,
          phone: data.phone ?? null,
          rne_file: data.rneFile ?? null,
          patente_file: data.patenteFile ?? null,
          avatar_url: data.avatar ?? null,
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      const currentAuthUser = await supabase.auth.getUser();
      await loadCurrentUser(currentAuthUser.data.user ?? null);
      return { success: true };
    },
    [loadCurrentUser, user],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isClient: user?.role === "client",
        isManager: user?.role === "manager",
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
