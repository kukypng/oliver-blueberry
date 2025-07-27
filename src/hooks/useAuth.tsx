import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { SecureRedirect } from '@/utils/secureRedirect';
import { SecurityValidation } from '@/utils/securityValidation';
import { AuthErrorBoundary } from '@/components/ErrorBoundaries';
import { useDevicePersistence } from '@/hooks/useDevicePersistence';

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
  isInitialized: boolean;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const { showSuccess, showError, showLoading } = useToast();
  const navigate = useNavigate();
  const { 
    isTrustedDevice, 
    trustDevice, 
    shouldMaintainLogin, 
    updateDeviceActivity,
    checkTrustedDevice 
  } = useDevicePersistence();

  // Função para salvar estado de login persistente
  const saveLoginState = (session: Session | null) => {
    if (session) {
      localStorage.setItem('supabase_session_timestamp', Date.now().toString());
      localStorage.setItem('supabase_user_preference', 'stay_logged_in');
      updateDeviceActivity();
      
      // Marcar dispositivo como confiável após login bem-sucedido
      if (!isTrustedDevice) {
        trustDevice();
      }
    } else {
      localStorage.removeItem('supabase_session_timestamp');
      localStorage.removeItem('supabase_user_preference');
    }
  };

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
    let initializationTimeout: NodeJS.Timeout;
    
    console.log('🔐 Iniciando AuthProvider...');
    
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, !!session);
        
        // Salvar estado de persistência
        saveLoginState(session);
        
        // Atualizar estado da sessão
        setSession(session);
        setUser(session?.user ?? null);
        
        // Marcar como carregamento concluído
        if (!isInitialized) {
          setIsInitialized(true);
        }
        setLoading(false);

        // Tratar eventos específicos baseados na página atual
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

        // Criar perfil se necessário (apenas para novos usuários)
        if (event === 'SIGNED_IN' && session?.user && window.location.pathname !== '/verify') {
          console.log('👤 Criando perfil para novo usuário...');
          setTimeout(async () => {
            try {
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();

              if (!existingProfile) {
                console.log('📝 Inserindo novo perfil...');
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
              console.error('❌ Erro ao criar perfil:', error);
            }
          }, 0);
        }
      }
    );

    // Verificar sessão existente com timeout de segurança
    const initializeAuth = async () => {
      try {
        console.log('🔍 Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
        }
        
        console.log('✅ Sessão obtida:', !!session);
        console.log('📱 Dispositivo confiável:', isTrustedDevice);
        console.log('🔄 Deve manter login:', shouldMaintainLogin());
        
        // Se tem sessão ou deve manter login baseado no dispositivo
        if (session || (shouldMaintainLogin() && session)) {
          setSession(session);
          setUser(session?.user ?? null);
          saveLoginState(session);
          
          if (session?.user) {
            console.log('🎉 Usuário já logado, mantendo sessão');
            console.log('👤 Usuário:', session.user.email);
            
            // Verificar se dispositivo é confiável para o usuário
            await checkTrustedDevice(session.user.id);
          }
        } else {
          console.log('❌ Nenhuma sessão válida encontrada');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Erro na inicialização de auth:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    // Timeout de segurança para marcação como inicializado
    initializationTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.log('⏰ Timeout de inicialização atingido');
        setIsInitialized(true);
        setLoading(false);
      }
    }, 3000);

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      clearTimeout(initializationTimeout);
    };
  }, []); // Remover dependências para evitar re-inicializações

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Tentando fazer login...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Erro no login:', signInError);
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
        console.log('✅ Login bem-sucedido, verificando perfil...');
        
        // Salvar preferência de persistência
        localStorage.setItem('supabase_user_preference', 'stay_logged_in');
        
        // Verificar existência do perfil
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', signInData.user.id)
          .maybeSingle();

        if (profileError || !profileData) {
          console.error('❌ Perfil não encontrado, fazendo logout...');
          await supabase.auth.signOut();
          showError({
            title: 'Erro no login',
            description: 'Não foi possível verificar seu perfil. Contate o suporte.',
          });
          return { error: profileError || new Error('Profile not found') };
        }

        console.log('🎉 Login completo, redirecionando...');
        showSuccess({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo de volta!'
        });
        
        // Navegação imediata para evitar delay
        navigate('/dashboard', { replace: true });
      }
      
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
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
      console.log('🚪 Fazendo logout...');
      
      // Limpar dados de persistência
      localStorage.removeItem('supabase_session_timestamp');
      localStorage.removeItem('supabase_user_preference');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      console.log('✅ Logout realizado com sucesso');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('❌ Erro no logout:', error);
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
    isInitialized,
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
