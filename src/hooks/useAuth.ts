import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'manager' | string;

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  expiration_date: string;
  budget_warning_enabled?: boolean;
  budget_warning_days?: number;
  advanced_features_enabled?: boolean;
  budget_limit?: number;
  username?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<{ error: any }>;
  signIn: (email: string, password: string, redirectTo?: string) => Promise<any>;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
  updateEmail?: (email: string) => Promise<any>;
  updatePassword?: (password: string) => Promise<any>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuth = (): AuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    
    switch (permission) {
      case 'view_admin':
        return profile.role === 'admin';
      case 'manage_users':
        return profile.role === 'admin';
      case 'manage_settings':
        return profile.role === 'admin' || profile.role === 'manager';
      default:
        return true;
    }
  };

  const signIn = async (email: string, password: string, redirectTo?: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, options?: any) => {
    return supabase.auth.signUp({ email, password, options });
  };

  const requestPasswordReset = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email);
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  const updateEmail = async (email: string) => {
    return supabase.auth.updateUser({ email });
  };

  const updatePassword = async (password: string) => {
    return supabase.auth.updateUser({ password });
  };

  return {
    user,
    profile,
    loading,
    signOut,
    signIn,
    signUp,
    requestPasswordReset,
    updateEmail,
    updatePassword,
    hasRole,
    hasPermission
  };
};