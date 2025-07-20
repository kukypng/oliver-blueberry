import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { SecureRedirect } from '@/utils/secureRedirect';
import { SecurityValidation } from '@/utils/securityValidation';
import { AuthErrorBoundary } from '@/components/ErrorBoundaries';

export type UserRole = 'admin' | 'manager' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  budget_limit: number | null;
  expiration_date: string;
  budget_warning_enabled: boolean;
  budget_warning_days: number;
  advanced_features_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { name: string; role?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateEmail: (email: string) => Promise<{ error: any }>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, showLoading } = useToast();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        return null;
      }
      return data as UserProfile;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache profile for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Sempre atualiza o estado da sessão
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Trata redirecionamentos e notificações com base no evento, especialmente da página /verify
        if (window.location.pathname === '/verify') {
          switch (event) {
            case 'PASSWORD_RECOVERY':
              navigate('/reset-password', { replace: true });
              return;
            case 'USER_UPDATED':
              showSuccess({
                title: 'Email atualizado!',
                description: 'Seu endereço de e-mail foi confirmado com sucesso.',
              });
              navigate('/dashboard', { replace: true });
              return;
            case 'SIGNED_IN':
               showSuccess({
                 title: 'Conta confirmada!',
                 description: 'Bem-vindo! Seu cadastro foi concluído.',
               });
               navigate('/dashboard', { replace: true });
               return;
            default:
              break;
          }
        }

        // Esta parte é executada para logins iniciais ou se não vier da página /verify
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();

              if (!existingProfile) {
                  await supabase
                    .from('user_profiles')
                    .insert({
                      id: session.user.id,
                      name: session.user.user_metadata?.name || session.user.email || 'Usuário',
                      role: 'user',
                      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                    });
              }
            } catch (error) {
              // Silent error handling
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, showSuccess]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const errorMessage = signInError.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos'
          : signInError.message;
        
        showError({
          title: 'Erro no login',
          description: errorMessage,
        });
        return { error: signInError };
      }

      if (signInData.user) {
        // Check user profile existence
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', signInData.user.id)
          .maybeSingle();

        if (profileError || !profileData) {
          await supabase.auth.signOut();
          showError({
            title: 'Erro no login',
            description: 'Não foi possível verificar seu perfil. Contate o suporte.',
          });
          return { error: profileError || new Error('Profile not found') };
        }

        showSuccess({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando...'
        });
        
        // Use React Router navigation instead of window.location.href
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      }
      
      return { error: null };
    } catch (error) {
      showError({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o login. Tente novamente.'
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role?: string }) => {
    try {
      const { signup: redirectUrl } = SecureRedirect.getAuthRedirectUrls();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData.name,
            role: userData.role || 'user'
          }
        }
      });
      
      if (error) {
        const errorMessage = error.message === 'User already registered'
          ? 'Usuário já cadastrado'
          : error.message;
          
        showError({
          title: 'Erro no cadastro',
          description: errorMessage,
          action: {
            label: 'Tentar Novamente',
            onClick: () => {}
          }
        });
      } else {
        showSuccess({
          title: 'Cadastro realizado!',
          description: 'Verifique seu email para confirmar a conta.',
          duration: 6000
        });
      }
      
      return { error };
    } catch (error) {
      showError({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o cadastro. Tente novamente.'
      });
      return { error };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { verify: redirectUrl } = SecureRedirect.getAuthRedirectUrls();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        showError({
          title: 'Erro ao solicitar',
          description: "Não foi possível enviar o link. Verifique o e-mail e tente novamente.",
        });
      } else {
        showSuccess({
          title: 'Link enviado!',
          description: 'Se o e-mail estiver cadastrado, um link de redefinição foi enviado.',
        });
      }
      return { error };
    } catch (error) {
      showError({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao solicitar a redefinição. Tente novamente.',
      });
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        showError({
          title: 'Erro ao atualizar senha',
          description: error.message,
        });
      } else {
        showSuccess({
          title: 'Senha atualizada!',
          description: 'Sua senha foi alterada com sucesso.',
        });
      }
      return { error };
    } catch (error) {
      showError({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao atualizar sua senha. Tente novamente.',
      });
      return { error };
    }
  };

  const updateEmail = async (email: string) => {
    try {
      const { verify: redirectUrl } = SecureRedirect.getAuthRedirectUrls();
      const { error } = await supabase.auth.updateUser(
        { email },
        { emailRedirectTo: redirectUrl }
      );

      if (error) {
        const errorMessage = error.message === 'New email address should be different from the current one.'
          ? 'O novo email deve ser diferente do atual.'
          : error.message;
        showError({
          title: 'Erro ao atualizar email',
          description: errorMessage,
        });
      } else {
        showSuccess({
          title: 'Confirmação enviada!',
          description: 'Verifique seu novo email para confirmar a alteração.',
        });
      }
      return { error };
    } catch (error) {
      showError({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao atualizar seu email. Tente novamente.',
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      navigate('/auth', { replace: true });
    } catch (error) {
      showError({
        title: 'Erro no logout',
        description: 'Ocorreu um erro ao desconectar. Tente novamente.'
      });
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!profile) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      manager: 2,
      admin: 3,
    };
    
    return roleHierarchy[profile.role] >= roleHierarchy[role];
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    const permissions: Record<UserRole, string[]> = {
      user: ['view_own_budgets', 'create_budgets', 'edit_own_budgets'],
      manager: ['view_all_budgets', 'manage_clients', 'view_reports'],
      admin: ['manage_users', 'manage_system', 'view_analytics'],
    };
    
    // Get all permissions for current role and higher
    const userPermissions: string[] = [];
    Object.entries(permissions).forEach(([role, perms]) => {
      if (hasRole(role as UserRole)) {
        userPermissions.push(...perms);
      }
    });
    
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
    updateEmail,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
