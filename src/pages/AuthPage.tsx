import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, requestPasswordReset, loading, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { data: isLicenseValid } = useLicenseValidation();

  const [licenseCode, setLicenseCode] = useState('');
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError({
        title: 'Erro no login',
        description: 'Por favor, preencha todos os campos.',
      });
      return;
    }
    await signIn(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      showError({
        title: 'Erro no cadastro',
        description: 'Por favor, preencha todos os campos.',
      });
      return;
    }
    await signUp(email, password, { name });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError({
        title: 'Erro na solicitação',
        description: 'Por favor, insira seu email.',
      });
      return;
    }
    await requestPasswordReset(email);
  };

  const handleActivateLicense = async () => {
    if (!licenseCode.trim() || !user?.id) return;
    
    setIsActivatingLicense(true);
    try {
      const { data, error } = await supabase.rpc('activate_license', {
        license_code: licenseCode.trim(),
        p_user_id: user.id
      });

      if (error) throw error;

      if ((data as any)?.success) {
        showSuccess({
          title: 'Licença Ativada!',
          description: 'Redirecionando para o dashboard...'
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showError({
          title: 'Erro na Ativação',
          description: (data as any)?.error || 'Código inválido'
        });
      }
    } catch (error: any) {
      showError({
        title: 'Erro Inesperado',
        description: 'Tente novamente'
      });
    } finally {
      setIsActivatingLicense(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-4 glass-card shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>
          <div className="text-center">
            {isSignUp ? (
              <>
                Já tem uma conta?{' '}
                <Link to="/auth" className="text-primary underline" onClick={() => setIsSignUp(false)}>
                  Entrar
                </Link>
              </>
            ) : (
              <>
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-primary underline" onClick={() => setIsSignUp(true)}>
                  Criar Conta
                </Link>
              </>
            )}
          </div>
          {!isSignUp && (
            <div className="text-center">
              <button onClick={handleResetPassword} className="text-sm text-muted-foreground hover:text-primary">
                Esqueceu a senha?
              </button>
            </div>
          )}
        </CardContent>
        {/* License Activation Section - Add this before the closing </div> of the card */}
        {user && !isLicenseValid && (
          <div className="mt-6 p-4 border rounded-lg bg-amber-50 border-amber-200">
            <div className="flex items-center space-x-2 mb-3">
              <Key className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800">Ative sua Licença</h3>
            </div>
            <p className="text-sm text-amber-700 mb-4">
              Para acessar o sistema, você precisa ativar uma licença válida.
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Digite seu código de licença"
                value={licenseCode}
                onChange={(e) => setLicenseCode(e.target.value)}
                className="font-mono"
                maxLength={13}
              />
              <Button
                onClick={handleActivateLicense}
                disabled={isActivatingLicense || !licenseCode.trim()}
                className="w-full"
                size="sm"
              >
                {isActivatingLicense ? 'Ativando...' : 'Ativar Licença'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
