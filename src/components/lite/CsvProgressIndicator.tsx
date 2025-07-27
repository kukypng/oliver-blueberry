import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ImportProgress } from '@/hooks/useBudgetImport';

interface CsvProgressIndicatorProps {
  progress: ImportProgress;
  isImporting: boolean;
}

export const CsvProgressIndicator: React.FC<CsvProgressIndicatorProps> = ({ 
  progress, 
  isImporting 
}) => {
  const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const isComplete = progress.completed >= progress.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isImporting && !isComplete && (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
          {isComplete && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {!isImporting && !isComplete && (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Progresso da Importação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processando registros...</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <Progress 
            value={percentage} 
            className="w-full"
          />
        </div>

        {/* Estatísticas */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Total: {progress.total}
          </Badge>
          <Badge variant="default">
            Processados: {progress.completed}
          </Badge>
          {progress.failed > 0 && (
            <Badge variant="destructive">
              Falhas: {progress.failed}
            </Badge>
          )}
          <Badge variant="secondary">
            Restantes: {Math.max(0, progress.total - progress.completed)}
          </Badge>
        </div>

        {/* Item atual sendo processado */}
        {progress.current && isImporting && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Processando:</span> {progress.current}
          </div>
        )}

        {/* Status final */}
        {isComplete && (
          <div className="text-sm">
            {progress.failed === 0 ? (
              <span className="text-green-600 font-medium">
                ✓ Importação concluída com sucesso!
              </span>
            ) : (
              <span className="text-yellow-600 font-medium">
                ⚠ Importação concluída com {progress.failed} erro(s)
              </span>
            )}
          </div>
        )}

        {/* Tempo estimado */}
        {isImporting && !isComplete && progress.completed > 0 && (
          <div className="text-xs text-muted-foreground">
            <EstimatedTime 
              completed={progress.completed}
              total={progress.total}
              startTime={Date.now()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface EstimatedTimeProps {
  completed: number;
  total: number;
  startTime: number;
}

const EstimatedTime: React.FC<EstimatedTimeProps> = ({ 
  completed, 
  total, 
  startTime 
}) => {
  const elapsed = Date.now() - startTime;
  const rate = completed / elapsed; // items per millisecond
  const remaining = total - completed;
  const estimatedTimeRemaining = remaining / rate;

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (completed < 2) return null; // Not enough data for estimation

  return (
    <div>
      Tempo estimado restante: {formatTime(estimatedTimeRemaining)}
    </div>
  );
};