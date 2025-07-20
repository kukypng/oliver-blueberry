// FASE 3: Error Boundary Específico para Detecção de Loops de Recarregamento
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoopDetectionState {
  hasError: boolean;
  errorCount: number;
  lastErrorTime: number;
  isInLoop: boolean;
  errorDetails: string | null;
}

interface LoopDetectionProps {
  children: ReactNode;
  maxErrors?: number;
  timeWindow?: number; // em milissegundos
  onLoopDetected?: () => void;
}

export class LoopDetectionBoundary extends Component<LoopDetectionProps, LoopDetectionState> {
  private retryCount = 0;
  private errorHistory: number[] = [];

  constructor(props: LoopDetectionProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorCount: 0,
      lastErrorTime: 0,
      isInLoop: false,
      errorDetails: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LoopDetectionState> {
    return {
      hasError: true,
      errorDetails: error.message || 'Erro desconhecido'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    const { maxErrors = 3, timeWindow = 10000 } = this.props; // 3 erros em 10 segundos

    // Adicionar erro ao histórico
    this.errorHistory.push(now);
    
    // Limpar erros antigos do histórico
    this.errorHistory = this.errorHistory.filter(time => now - time < timeWindow);

    // Detectar se estamos em um loop
    const isInLoop = this.errorHistory.length >= maxErrors;

    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1,
      lastErrorTime: now,
      isInLoop
    }));

    // Log detalhado para debug
    console.error('LoopDetectionBoundary caught error:', {
      error: error.message,
      errorInfo: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1,
      isInLoop,
      timestamp: new Date(now).toISOString()
    });

    // Notificar callback se loop detectado
    if (isInLoop && this.props.onLoopDetected) {
      this.props.onLoopDetected();
    }

    // Auto-recovery para erros únicos (não loops)
    if (!isInLoop && this.retryCount < 2) {
      setTimeout(() => {
        this.handleRetry();
      }, 1000 * (this.retryCount + 1)); // Delay crescente
    }
  }

  handleRetry = () => {
    this.retryCount++;
    this.setState({
      hasError: false,
      errorDetails: null
    });
  };

  handleForceRetry = () => {
    // Reset completo
    this.retryCount = 0;
    this.errorHistory = [];
    this.setState({
      hasError: false,
      errorCount: 0,
      lastErrorTime: 0,
      isInLoop: false,
      errorDetails: null
    });
  };

  handleGoHome = () => {
    // Limpar sessionStorage e localStorage relacionados ao estado
    const keysToRemove = [
      'oliver-dashboard-state',
      'oliver-last-route',
      'oliver-cache'
    ];
    
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });

    // Navegar para home
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { isInLoop, errorCount, errorDetails } = this.state;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle 
                className={`h-12 w-12 ${isInLoop ? 'text-destructive' : 'text-orange-500'}`} 
              />
            </div>
            <CardTitle className="text-xl font-bold">
              {isInLoop ? 'Loop de Erro Detectado' : 'Ops! Algo deu errado'}
            </CardTitle>
            <CardDescription>
              {isInLoop 
                ? `Detectamos ${errorCount} erros seguidos. O aplicativo pode estar em um loop.`
                : 'Ocorreu um erro inesperado. Tentando recuperar automaticamente...'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {errorDetails && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground font-mono">
                  {errorDetails}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {!isInLoop && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              )}

              {isInLoop && (
                <Button 
                  onClick={this.handleForceRetry}
                  className="w-full"
                  variant="secondary"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Forçar Recuperação
                </Button>
              )}

              <Button 
                onClick={this.handleGoHome}
                className="w-full"
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </div>

            {isInLoop && (
              <div className="mt-4 p-3 bg-muted rounded-md text-center">
                <p className="text-xs text-muted-foreground">
                  Se o problema persistir, limpe o cache do navegador ou 
                  contate o suporte técnico.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}