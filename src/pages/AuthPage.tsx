import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export const AuthPage = () => {
  const {
    signIn,
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [isFetchingCreds, setIsFetchingCreds] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  useEffect(() => {
    const fetchCredentials = async (paymentId: string) => {
      setIsFetchingCreds(true);
      setCredentialError(null);
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('get-temporary-credentials', {
          body: {
            payment_id: paymentId
          }
        });
        if (error) {
          const errorData = await (error as any).context.json();
          throw new Error(errorData.error || 'Erro desconhecido');
        }
        setCredentials(data);
      } catch (err: any) {
        console.error("Failed to fetch credentials:", err);
        setCredentialError(err.message || "Não foi possível carregar suas credenciais. Por favor, entre em contato com o suporte.");
      } finally {
        setIsFetchingCreds(false);
        window.history.replaceState({}, document.title, "/auth");
      }
    };
    if (searchParams.get('signup_complete') === 'true') {
      const paymentId = searchParams.get('payment_id');
      if (paymentId) {
        fetchCredentials(paymentId);
      }
    }
  }, [searchParams]);

  // Redirecionar usuários já logados
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Mostrar loading se usuário já está logado ou buscando credenciais
  if (authLoading || user) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (isFetchingCreds) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10">
        <div className="text-center p-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Finalizando seu Cadastro</h1>
          <p className="text-lg text-muted-foreground mt-2">Estamos gerando suas credenciais de acesso...</p>
        </div>
      </div>;
  }
  if (credentials) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4 relative overflow-hidden">
         <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '1s'
        }}></div>
          </div>
        <div className="w-full max-w-md relative z-10">
            <Card className="glass-card animate-scale-in border-0 shadow-2xl backdrop-blur-xl">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl text-foreground">Conta Criada com Sucesso!</CardTitle>
                    <CardDescription className="text-base">
                        Anote suas credenciais de acesso. Elas são exibidas apenas uma vez.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label>Email</Label>
                        <Input readOnly value={credentials.email} className="h-12 text-base rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <Label>Senha Temporária</Label>
                        <Input readOnly value={credentials.password} className="h-12 text-base rounded-xl font-mono tracking-wider" />
                    </div>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Importante!</AlertTitle>
                        <AlertDescription>
                            Guarde esta senha em um local seguro. Você precisará dela para fazer o login.
                        </AlertDescription>
                    </Alert>
                    <Button onClick={() => setCredentials(null)} className="w-full h-12 text-base">
                        Ir para o Login
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>;
  }
  if (credentialError) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md glass-card animate-scale-in border-0 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Ocorreu um Erro</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{credentialError}</p>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Voltar para o Login
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginForm.email, loginForm.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
      </div>

      {/* Theme toggle */}

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <img alt="Oliver Logo" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 animate-bounce-subtle invert dark:invert-0 dark:mix-blend-lighten" src="/lovable-uploads/logoo.png" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight">Oliver</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Sistema de Gestão de Orçamentos</p>
        </div>

        <Card className="glass-card animate-scale-in border-0 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-foreground">Acesso Restrito</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Faça login para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={loginForm.email} onChange={e => setLoginForm({
                ...loginForm,
                email: e.target.value
              })} required className="h-12 text-base rounded-xl input-focus mobile-touch" />
              </div>
              <div className="space-y-2 sm:space-y-3 relative">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <Link to="/reset-password" className="text-sm font-medium text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({
                ...loginForm,
                password: e.target.value
              })} required className="h-12 text-base rounded-xl input-focus mobile-touch pr-12" />
                <Button type="button" variant="ghost" size="icon" className="absolute bottom-1 right-1 h-10 w-10 text-muted-foreground hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mobile-touch" disabled={loading}>
                {loading ? <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </> : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in">
          <p>
            Não tem uma conta?{' '}
            <Link to="/plans" className="font-semibold text-primary hover:underline">Crie uma aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
};