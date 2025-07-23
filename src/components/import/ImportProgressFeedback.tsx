import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  Clock,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { ImportSummary } from '@/utils/csv/validationTypes';
import { cn } from '@/lib/utils';

interface ImportProgressFeedbackProps {
  summary?: ImportSummary | null;
  isProcessing: boolean;
  onPreview?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * ✅ COMPONENTE DE FEEDBACK AVANÇADO PARA IMPORTAÇÃO
 * 
 * Funcionalidades:
 * - Progress visual da análise
 * - Categorização inteligente de problemas
 * - Preview dos dados antes da importação
 * - Ações contextuais baseadas no resultado
 */
export const ImportProgressFeedback: React.FC<ImportProgressFeedbackProps> = ({
  summary,
  isProcessing,
  onPreview,
  onConfirm,
  onCancel,
  className
}) => {
  if (isProcessing) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Analisando arquivo...</p>
              <p className="text-sm text-muted-foreground">
                Validando dados e preparando preview
              </p>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  // Calcular estatísticas
  const successRate = summary.totalRows > 0 
    ? Math.round((summary.validRows / summary.totalRows) * 100)
    : 0;

  const draftCount = summary.processedData.filter(item => 
    item.status === 'draft' || item.total_price === 0
  ).length;

  const activeCount = summary.validRows - draftCount;

  // Determinar status geral
  const getOverallStatus = () => {
    if (summary.validRows === 0) return 'error';
    if (summary.invalidRows > 0 || summary.warnings > 0) return 'warning';
    return 'success';
  };

  const status = getOverallStatus();

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Arquivo válido e pronto para importação';
      case 'warning':
        return 'Arquivo processado com avisos';
      case 'error':
        return 'Problemas encontrados no arquivo';
      default:
        return 'Análise concluída';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Resultado da Análise
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getStatusMessage()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taxa de Sucesso</span>
            <span className="font-medium">{successRate}%</span>
          </div>
          <Progress 
            value={successRate} 
            className={cn(
              "h-2",
              status === 'success' && "bg-green-100",
              status === 'warning' && "bg-yellow-100",
              status === 'error' && "bg-red-100"
            )}
          />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{summary.totalRows}</div>
            <div className="text-xs text-muted-foreground">Total de Registros</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
            <div className="text-xs text-muted-foreground">Registros Válidos</div>
          </div>

          {activeCount > 0 && (
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Orçamentos Ativos</div>
            </div>
          )}

          {draftCount > 0 && (
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{draftCount}</div>
              <div className="text-xs text-muted-foreground">Rascunhos</div>
            </div>
          )}
        </div>

        {/* Badges de Status */}
        <div className="flex flex-wrap gap-2">
          {summary.validRows > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {summary.validRows} Válidos
            </Badge>
          )}
          
          {summary.invalidRows > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              {summary.invalidRows} Inválidos
            </Badge>
          )}
          
          {summary.warnings > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {summary.warnings} Avisos
            </Badge>
          )}

          {draftCount > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Clock className="h-3 w-3 mr-1" />
              {draftCount} Rascunhos
            </Badge>
          )}
        </div>

        {/* Erros (se houver) */}
        {summary.errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Problemas Encontrados:
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {summary.errors.slice(0, 5).map((error, index) => (
                <p key={index} className="text-xs text-red-700">
                  • {error}
                </p>
              ))}
              {summary.errors.length > 5 && (
                <p className="text-xs text-red-600 font-medium">
                  + {summary.errors.length - 5} erros adicionais...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {summary.validRows > 0 && onPreview && (
            <Button 
              variant="outline" 
              onClick={onPreview}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          {summary.validRows > 0 && onConfirm && (
            <Button 
              onClick={onConfirm}
              className="flex-1"
              disabled={summary.validRows === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Importar ({summary.validRows})
            </Button>
          )}
          
          {onCancel && (
            <Button 
              variant="ghost" 
              onClick={onCancel}
              size="sm"
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};