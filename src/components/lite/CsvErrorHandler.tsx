import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertTriangle, XCircle, Info, Download } from 'lucide-react';
import { CsvError } from '@/types/csv';

interface CsvErrorHandlerProps {
  errors: CsvError[];
  onDownloadErrorReport?: () => void;
}

interface GroupedError {
  field: string;
  count: number;
  errors: CsvError[];
  severity: 'critical' | 'warning' | 'info';
}

export const CsvErrorHandler: React.FC<CsvErrorHandlerProps> = ({ 
  errors, 
  onDownloadErrorReport 
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (field: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedGroups(newExpanded);
  };

  const getSeverity = (field: string): 'critical' | 'warning' | 'info' => {
    const criticalFields = ['tipo_aparelho', 'servico_aparelho', 'preco_vista', 'preco_parcelado'];
    const warningFields = ['metodo_pagamento', 'garantia_meses', 'validade_dias'];
    
    if (criticalFields.includes(field)) return 'critical';
    if (warningFields.includes(field)) return 'warning';
    return 'info';
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'outline' as const;
    }
  };

  // Agrupar erros por campo
  const groupedErrors: GroupedError[] = errors.reduce((acc, error) => {
    const existing = acc.find(group => group.field === error.field);
    if (existing) {
      existing.count++;
      existing.errors.push(error);
    } else {
      acc.push({
        field: error.field,
        count: 1,
        errors: [error],
        severity: getSeverity(error.field)
      });
    }
    return acc;
  }, [] as GroupedError[]);

  // Ordenar por severidade e depois por quantidade
  groupedErrors.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.count - a.count;
  });

  const criticalErrors = groupedErrors.filter(g => g.severity === 'critical');
  const warningErrors = groupedErrors.filter(g => g.severity === 'warning');
  const infoErrors = groupedErrors.filter(g => g.severity === 'info');

  const generateErrorReport = () => {
    const report = [
      'RELATÓRIO DE ERROS - IMPORTAÇÃO CSV',
      '=' .repeat(50),
      '',
      `Total de erros: ${errors.length}`,
      `Erros críticos: ${criticalErrors.reduce((sum, g) => sum + g.count, 0)}`,
      `Avisos: ${warningErrors.reduce((sum, g) => sum + g.count, 0)}`,
      `Informações: ${infoErrors.reduce((sum, g) => sum + g.count, 0)}`,
      '',
      'DETALHES DOS ERROS:',
      '-'.repeat(30),
      ''
    ];

    groupedErrors.forEach(group => {
      report.push(`${group.field.toUpperCase()} (${group.count} erro(s))`);
      group.errors.forEach(error => {
        report.push(`  Linha ${error.row}: ${error.message}`);
        if (error.value) {
          report.push(`    Valor: "${error.value}"`);
        }
      });
      report.push('');
    });

    return report.join('\n');
  };

  const downloadErrorReport = () => {
    const reportContent = generateErrorReport();
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const filename = `relatorio-erros-csv-${new Date().toISOString().split('T')[0]}.txt`;
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onDownloadErrorReport) {
      onDownloadErrorReport();
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Erros na Importação ({errors.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadErrorReport}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Baixar Relatório
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="flex flex-wrap gap-2">
          {criticalErrors.length > 0 && (
            <Badge variant="destructive">
              {criticalErrors.reduce((sum, g) => sum + g.count, 0)} Críticos
            </Badge>
          )}
          {warningErrors.length > 0 && (
            <Badge variant="secondary">
              {warningErrors.reduce((sum, g) => sum + g.count, 0)} Avisos
            </Badge>
          )}
          {infoErrors.length > 0 && (
            <Badge variant="outline">
              {infoErrors.reduce((sum, g) => sum + g.count, 0)} Informações
            </Badge>
          )}
        </div>

        {/* Alerta geral */}
        {criticalErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Foram encontrados erros críticos que impedem a importação. 
              Corrija os problemas no arquivo CSV e tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de erros agrupados */}
        <ScrollArea className="h-80 w-full border rounded">
          <div className="p-4 space-y-3">
            {groupedErrors.map((group) => (
              <Collapsible
                key={group.field}
                open={expandedGroups.has(group.field)}
                onOpenChange={() => toggleGroup(group.field)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                  >
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(group.severity)}
                      <span className="font-medium">{group.field}</span>
                      <Badge variant={getSeverityVariant(group.severity)} className="text-xs">
                        {group.count} erro(s)
                      </Badge>
                    </div>
                    {expandedGroups.has(group.field) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-2 pt-2">
                  {group.errors.map((error, index) => (
                    <div 
                      key={index} 
                      className="ml-6 p-2 border rounded bg-muted/50 text-sm"
                    >
                      <div className="font-medium text-muted-foreground">
                        Linha {error.row}
                      </div>
                      <div className="text-foreground">
                        {error.message}
                      </div>
                      {error.value && (
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          Valor: "{error.value}"
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>

        {/* Sugestões de correção */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Dicas para correção:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Verifique se todos os campos obrigatórios estão preenchidos</li>
              <li>• Confirme se os valores numéricos estão no formato correto</li>
              <li>• Use "sim" ou "não" para campos de verdadeiro/falso</li>
              <li>• Baixe o template CSV para ver o formato esperado</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};