/**
 * Preview de Dados Otimizado para Mobile
 * 
 * Versão simplificada da tabela de preview focada em dispositivos móveis
 * com interface touch-friendly e navegação otimizada.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParseResult, ParseError } from '@/utils/import-export/universalParser';

export interface MobileDataPreviewProps {
  data: any[];
  parseResult?: ParseResult;
  className?: string;
  maxRows?: number;
}

interface ColumnInfo {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  hasErrors: boolean;
}

export const MobileDataPreview: React.FC<MobileDataPreviewProps> = ({
  data,
  parseResult,
  className,
  maxRows = 50
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showErrors, setShowErrors] = useState(true);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  // Processar dados limitados para mobile
  const processedData = useMemo(() => {
    return data.slice(0, maxRows);
  }, [data, maxRows]);

  // Filtrar dados baseado na busca
  const filteredData = useMemo(() => {
    if (!searchTerm) return processedData;
    
    return processedData.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [processedData, searchTerm]);

  // Analisar colunas
  const columns = useMemo((): ColumnInfo[] => {
    if (filteredData.length === 0) return [];
    
    const firstRow = filteredData[0];
    const errorsByColumn = new Map<string, number>();
    
    // Contar erros por coluna
    parseResult?.errors.forEach(error => {
      if (error.column) {
        errorsByColumn.set(error.column, (errorsByColumn.get(error.column) || 0) + 1);
      }
    });
    
    return Object.keys(firstRow).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: inferColumnType(firstRow[key]) as 'text' | 'number' | 'date' | 'boolean',
      hasErrors: errorsByColumn.has(key)
    }));
  }, [filteredData, parseResult]);

  // Obter erros para uma linha específica
  const getRowErrors = (rowIndex: number): ParseError[] => {
    return parseResult?.errors.filter(error => 
      error.row === rowIndex + 1
    ) || [];
  };

  // Obter erros para um campo específico
  const getFieldErrors = (rowIndex: number, fieldKey: string): ParseError[] => {
    return getRowErrors(rowIndex).filter(error => error.column === fieldKey);
  };

  // Toggle campo expandido
  const toggleFieldExpansion = (fieldKey: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldKey)) {
      newExpanded.delete(fieldKey);
    } else {
      newExpanded.add(fieldKey);
    }
    setExpandedFields(newExpanded);
  };

  // Renderizar valor do campo
  const renderFieldValue = (value: any, column: ColumnInfo, rowIndex: number) => {
    const fieldErrors = getFieldErrors(rowIndex, column.key);
    const hasErrors = fieldErrors.length > 0;
    const isExpanded = expandedFields.has(column.key);
    
    let displayValue = String(value || '');
    
    // Formatar baseado no tipo
    if (column.type === 'number' && value !== null && value !== undefined) {
      displayValue = Number(value).toLocaleString();
    } else if (column.type === 'date' && value) {
      try {
        displayValue = new Date(value).toLocaleDateString();
      } catch {
        displayValue = String(value);
      }
    } else if (column.type === 'boolean') {
      displayValue = value ? 'Sim' : 'Não';
    }

    // Truncar texto longo
    const shouldTruncate = displayValue.length > 50 && !isExpanded;
    const truncatedValue = shouldTruncate ? displayValue.substring(0, 50) + '...' : displayValue;

    return (
      <div className="space-y-1">
        <div 
          className={cn(
            'p-2 rounded-lg border text-sm',
            hasErrors && showErrors 
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'border-border bg-muted/50'
          )}
          onClick={() => shouldTruncate && toggleFieldExpansion(column.key)}
        >
          <div className="flex items-start justify-between">
            <span className={cn(
              'flex-1',
              shouldTruncate && 'cursor-pointer'
            )}>
              {truncatedValue}
            </span>
            
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFieldExpansion(column.key);
                }}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {hasErrors && showErrors && (
            <div className="mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-600">
                {fieldErrors[0].message}
              </span>
            </div>
          )}
        </div>
        
        {column.type !== 'text' && (
          <Badge variant="outline" className="text-xs">
            {column.type}
          </Badge>
        )}
      </div>
    );
  };

  if (filteredData.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum dado encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRow = filteredData[currentIndex];
  const rowErrors = getRowErrors(currentIndex);
  const hasRowErrors = rowErrors.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header com estatísticas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Preview dos Dados
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {filteredData.length} registros
              </Badge>
              {parseResult?.errors && parseResult.errors.length > 0 && (
                <Badge variant="outline" className="text-red-600">
                  {parseResult.errors.length} erros
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nos dados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Controles */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrors(!showErrors)}
              className={cn(showErrors && 'bg-red-50 text-red-700')}
            >
              {showErrors ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showErrors ? 'Ocultar Erros' : 'Mostrar Erros'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} de {filteredData.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card do registro atual */}
      <Card className={cn(
        hasRowErrors && showErrors && 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Registro #{currentIndex + 1}
              {hasRowErrors && showErrors && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            
            {hasRowErrors && showErrors && (
              <Badge variant="outline" className="text-red-600">
                {rowErrors.length} erro(s)
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Campos do registro */}
          <div className="space-y-3">
            {columns.map(column => (
              <div key={column.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {column.label}
                    {column.hasErrors && showErrors && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </label>
                </div>
                
                {renderFieldValue(currentRow[column.key], column, currentIndex)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex-1 mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <div className="px-4 text-sm text-muted-foreground whitespace-nowrap">
              {currentIndex + 1} / {filteredData.length}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.min(filteredData.length - 1, currentIndex + 1))}
              disabled={currentIndex === filteredData.length - 1}
              className="flex-1 ml-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de erros */}
      {showErrors && parseResult?.errors && parseResult.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Resumo de Erros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parseResult.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400 p-2 bg-white dark:bg-red-900/10 rounded">
                  <div className="font-medium">Linha {error.row}</div>
                  <div>{error.message}</div>
                </div>
              ))}
              {parseResult.errors.length > 5 && (
                <div className="text-sm text-red-500 text-center py-2">
                  ... e mais {parseResult.errors.length - 5} erros
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Utilitário para inferir tipo de coluna
function inferColumnType(value: any): string {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
  if (typeof value === 'string' && !isNaN(Number(value))) return 'number';
  return 'text';
}