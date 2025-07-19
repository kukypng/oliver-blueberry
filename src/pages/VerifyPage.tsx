
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

export const VerifyPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [timedOut, setTimedOut] = useState(false);

  // A lógica principal agora está no onAuthStateChange do useAuth.tsx.
  // Esta página apenas exibe um estado de carregamento e trata os timeouts.

  useEffect(() => {
    const timer = setTimeout(() => {
      console.error('A verificação expirou. O link pode ser inválido ou ter expirado.');
      showError({
        title: 'Falha na Verificação',
        description: 'O link de verificação é inválido ou expirou. Por favor, tente novamente.',
      });
      setTimedOut(true);
    }, 10000); // Timeout de 10 segundos

    return () => clearTimeout(timer);
  }, [showError]);

  if (timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link Inválido</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Não foi possível verificar seu link. Ele pode ter expirado ou já ter sido usado.
        </p>
        <Button onClick={() => navigate('/auth', { replace: true })}>
          Voltar para o Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg">Verificando seu link, por favor aguarde...</p>
    </div>
  );
};
