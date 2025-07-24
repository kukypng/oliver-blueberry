/**
 * Tabela de Preview de Dados Interativa
 * 
 * Componente avançado para visualização e edição de dados importados
 * com suporte a paginação, filtros, validação e highlight de erros.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParseResult, ParseError } from '@/utils/import-export/universalParser';

export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required?: boolean;
  editable?: boolean;
  width?: number;
  formatter?: (value: any) => string;
  validator?: (value: any) => string | null;
}

export interface DataPreviewTableProps {
  data: any[];
  columns?: ColumnDefinition[];
  parseResult?: ParseResult;
  editable?: boolean;
  onCellEdit?: (rowIndex: number, columnKey: string, newValue: any) => void;
  onRowValidate?: (rowIndex: number, row: any) => ParseError[];
  className?: string;
  maxHeight?: number;
}

interface EditingCell {
  rowIndex: number;
  columnKey: string;
  value: any;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  data,
  columns,
  parseResult,
  editable = false,
  onCellEdit,
  onRowValidate,
  className,
  maxHeight = 600
}) => {
  // Estados
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [showErrors, setShowErrors] = useState(true);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Gerar colunas automaticamente se não fornecidas
  const finalColumns = useMemo(() => {
    if (columns) return columns;
    
    if (data.length === 0) return [];
    
    const firstRow = data[0];
    return Object.keys(firstRow).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: inferColumnType(firstRow[key]) as 'text' | 'number' | 'date' | 'boolean',
      editable: true,
      required: false,
      width: undefined
    }));
  }, [data, columns]);

  // Filtrar e paginar dados
  const filteredData = useMemo(() => {
    let filtered = data;

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar filtro por coluna
    if (filterColumn) {
      filtered = filtered.filter(row => {
        const value = row[filterColumn];
        return value !== null && value !== undefined && String(value).trim() !== '';
      });
    }

    return filtered;
  }, [data, searchTerm, filterColumn]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Obter erros para uma linha específica
  const getRowErrors = useCallback((rowIndex: number): ParseError[] => {
    const globalRowIndex = (currentPage - 1) * pageSize + rowIndex;
    
    // Erros do parse result
    const parseErrors = parseResult?.errors.filter(error => 
      error.row === globalRowIndex + 1
    ) || [];
    
    // Erros de validação customizada
    const validationErrors = onRowValidate ? 
      onRowValidate(globalRowIndex, data[globalRowIndex]) : [];
    
    return [...parseErrors, ...validationErrors];
  }, [parseResult, onRowValidate, data, currentPage, pageSize]);

  // Obter erros para uma célula específica
  const getCellErrors = useCallback((rowIndex: number, columnKey: string): ParseError[] => {
    return getRowErrors(rowIndex).filter(error => error.column === columnKey);
  }, [getRowErrors]);

  // Handlers
  const handleCellClick = (rowIndex: number, columnKey: string, currentValue: any) => {
    if (!editable) return;
    
    const column = finalColumns.find(col => col.key === columnKey);
    if (!column?.editable) return;

    setEditingCell({ rowIndex, columnKey, value: currentValue });
  };

  const handleCellSave = () => {
    if (!editingCell || !onCellEdit) return;

    const column = finalColumns.find(col => col.key === editingCell.columnKey);
    let processedValue = editingCell.value;

    // Processar valor baseado no tipo
    if (column?.type === 'number') {
      processedValue = parseFloat(processedValue) || 0;
    } else if (column?.type === 'boolean') {
      processedValue = processedValue === 'true' || processedValue === true;
    }

    const globalRowIndex = (currentPage - 1) * pageSize + editingCell.rowIndex;
    onCellEdit(globalRowIndex, editingCell.columnKey, processedValue);
    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(columnKey)) {
      newHidden.delete(columnKey);
    } else {
      newHidden.add(columnKey);
    }
    setHiddenColumns(newHidden);
  };

  const visibleColumns = finalColumns.filter(col => !hiddenColumns.has(col.key));

  // Renderizar célula
  const renderCell = (row: any, column: ColumnDefinition, rowIndex: number) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;
    const errors = getCellErrors(rowIndex, column.key);
    const hasErrors = errors.length > 0;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editingCell.value}
            onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
            className="h-8 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCellSave();
              if (e.key === 'Escape') handleCellCancel();
            }}
          />
          <Button size="sm" variant="ghost" onClick={handleCellSave} className="h-6 w-6 p-0">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCellCancel} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    const formattedValue = column.formatter ? column.formatter(value) : String(value || '');

    return (
      <div 
        className={cn(
          'relative group cursor-pointer p-1 rounded',
          hasErrors && 'bg-red-50 dark:bg-red-900/20',
          editable && column.editable && 'hover:bg-muted/50'
        )}
        onClick={() => handleCellClick(rowIndex, column.key, value)}
      >
        <span className={cn(
          'text-sm',
          hasErrors && 'text-red-700 dark:text-red-300'
        )}>
          {formattedValue}
        </span>
        
        {editable && column.editable && (
          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 absolute top-1 right-1" />
        )}
        
        {hasErrors && (
          <div className="absolute -top-1 -right-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Preview dos Dados ({filteredData.length} registros)
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {parseResult && (
                <>
                  <Badge variant="outline" className="text-green-600">
                    {parseResult.metadata.processedRows} processados
                  </Badge>
                  {parseResult.errors.length > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      {parseResult.errors.length} erros
                    </Badge>
                  )}
                  {parseResult.warnings.length > 0 && (
                    <Badge variant="outline" className="text-yellow-600">
                      {parseResult.warnings.length} avisos
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Busca e Filtros */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar em todos os campos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterColumn} onValueChange={setFilterColumn}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por coluna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as colunas</SelectItem>
                {finalColumns.map(col => (
                  <SelectItem key={col.key} value={col.key}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrors(!showErrors)}
              className={cn(showErrors && 'bg-red-50 text-red-700')}
            >
              {showErrors ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showErrors ? 'Ocultar Erros' : 'Mostrar Erros'}
            </Button>
          </div>

          {/* Controle de Colunas */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Colunas:</span>
            {finalColumns.map(col => (
              <Button
                key={col.key}
                variant="outline"
                size="sm"
                onClick={() => toggleColumnVisibility(col.key)}
                className={cn(
                  'h-6 text-xs',
                  hiddenColumns.has(col.key) && 'opacity-50'
                )}
              >
                {hiddenColumns.has(col.key) ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {col.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <div style={{ maxHeight }} className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {visibleColumns.map(column => (
                  <TableHead 
                    key={column.key} 
                    style={{ width: column.width }}
                    className={cn(column.required && 'font-semibold')}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.required && <span className="text-red-500">*</span>}
                      {column.type !== 'text' && (
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {paginatedData.map((row, rowIndex) => {
                const rowErrors = getRowErrors(rowIndex);
                const hasRowErrors = rowErrors.length > 0;
                
                return (
                  <TableRow 
                    key={rowIndex}
                    className={cn(
                      hasRowErrors && showErrors && 'bg-red-50/50 dark:bg-red-900/10'
                    )}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {(currentPage - 1) * pageSize + rowIndex + 1}
                        {hasRowErrors && showErrors && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    
                    {visibleColumns.map(column => (
                      <TableCell key={column.key} className="p-1">
                        {renderCell(row, column, rowIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Paginação */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Mostrando {Math.min(pageSize, filteredData.length)} de {filteredData.length} registros
              </span>
              
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Erros */}
      {showErrors && parseResult?.errors && parseResult.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erros Encontrados ({parseResult.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-auto">
              {parseResult.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400">
                  <strong>Linha {error.row}:</strong> {error.message}
                </div>
              ))}
              {parseResult.errors.length > 10 && (
                <div className="text-sm text-red-500">
                  ... e mais {parseResult.errors.length - 10} erros
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