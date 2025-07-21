import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { ImportSummary } from '@/utils/csv/validationTypes';

interface ImportPreviewProps {
  summary: ImportSummary;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  summary,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  const hasWarnings = summary.warnings > 0;
  const hasErrors = summary.errors.length > 0;
  const canImport = summary.validRows > 0 && !isProcessing;

  const totalValue = summary.processedData.reduce((sum, budget) => {
    return sum + (budget.total_price || 0);
  }, 0);

  const formatCurrency = (valueInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInCents / 100);
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Resumo da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.totalRows}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
              <div className="text-sm text-muted-foreground">Válidos</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.invalidRows}</div>
              <div className="text-sm text-muted-foreground">Erros</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{summary.warnings}</div>
              <div className="text-sm text-muted-foreground">Avisos</div>
            </div>
          </div>

          {summary.validRows > 0 && (
            <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-center">
                <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Valor Total Estimado
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalValue)}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {summary.validRows > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {summary.validRows} Válido{summary.validRows !== 1 ? 's' : ''}
              </Badge>
            )}
            {hasWarnings && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {summary.warnings} Aviso{summary.warnings !== 1 ? 's' : ''}
              </Badge>
            )}
            {hasErrors && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                {summary.errors.length} Erro{summary.errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {hasErrors && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Erros encontrados:</div>
                <div className="max-h-32 overflow-y-auto">
                  {summary.errors.slice(0, 3).map((error, index) => (
                    <div key={index} className="text-sm">• {error}</div>
                  ))}
                  {summary.errors.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      ... e mais {summary.errors.length - 3} erro(s)
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={onConfirm} disabled={!canImport}>
              {isProcessing ? 'Importando...' : `Importar ${summary.validRows} orçamento${summary.validRows !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};