import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'manager';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  expiration_date: string;
  budget_warning_enabled?: boolean;
  budget_warning_days?: number;
  advanced_features_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<{ error: any }>;
  signIn: (email: string, password: string, redirectTo?: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
      setProfile(data);
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

  const hasRole = (role: UserRole) => {
    return profile?.role === role;
  };

  const hasPermission = (permission: string) => {
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

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const requestPasswordReset = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email);
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut,
      signIn,
      signUp,
      requestPasswordReset,
      hasRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};