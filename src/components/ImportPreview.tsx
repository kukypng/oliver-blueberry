import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
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
  const hasErrors = summary.errors.length > 0;
  const hasValidData = summary.validRows > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Prévia da Importação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo geral */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{summary.totalRows}</div>
            <div className="text-sm text-muted-foreground">Total de linhas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
            <div className="text-sm text-muted-foreground">Válidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.invalidRows}</div>
            <div className="text-sm text-muted-foreground">Com erros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
            <div className="text-sm text-muted-foreground">Avisos</div>
          </div>
        </div>

        <Separator />

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {hasValidData && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              {summary.validRows} orçamento{summary.validRows !== 1 ? 's' : ''} válido{summary.validRows !== 1 ? 's' : ''}
            </Badge>
          )}
          {summary.invalidRows > 0 && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              {summary.invalidRows} com erro{summary.invalidRows !== 1 ? 's' : ''}
            </Badge>
          )}
          {summary.warnings > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {summary.warnings} aviso{summary.warnings !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Alertas */}
        {hasValidData && summary.invalidRows > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Apenas os orçamentos válidos serão importados. Os registros com erros serão ignorados.
            </AlertDescription>
          </Alert>
        )}

        {hasErrors && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Erros encontrados:</div>
                <div className="max-h-32 overflow-y-auto">
                  {summary.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm">• {error}</div>
                  ))}
                  {summary.errors.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      ... e mais {summary.errors.length - 5} erro(s)
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {summary.warnings > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Alguns campos estavam vazios e foram preenchidos com valores padrão. 
              Você pode revisar os dados após a importação.
            </AlertDescription>
          </Alert>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!hasValidData || isProcessing}
          >
            {isProcessing ? 'Importando...' : `Importar ${summary.validRows} orçamento${summary.validRows !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};