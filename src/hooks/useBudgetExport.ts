import { useState, useCallback } from 'react';
import { CsvExportFilters } from '@/types/csv';
import { BudgetMapper } from '@/utils/csv/budgetMapper';
import { CsvFormatter } from '@/utils/csv/formatter';
import { useSecureBudgets } from '@/hooks/useSecureBudgets';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ExportOptions {
  filters?: CsvExportFilters;
  includeDeleted?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportStats {
  totalBudgets: number;
  exportedCount: number;
  filteredOut: number;
  fileSize: string;
}

export const useBudgetExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);
  const { user } = useAuth();
  const { budgets, isLoading } = useSecureBudgets(user?.id);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const applyFilters = useCallback((budgetList: any[], filters?: CsvExportFilters) => {
    if (!filters) return budgetList;

    return budgetList.filter(budget => {
      // Filtro por tipo de aparelho
      if (filters.tipo_aparelho && filters.tipo_aparelho.length > 0) {
        if (!filters.tipo_aparelho.includes(budget.device_type)) {
          return false;
        }
      }

      // Filtro por garantia
      if (filters.garantia_min !== undefined && budget.warranty_months < filters.garantia_min) {
        return false;
      }
      if (filters.garantia_max !== undefined && budget.warranty_months > filters.garantia_max) {
        return false;
      }

      // Filtro por preço
      const price = budget.cash_price || budget.total_price || 0;
      if (filters.preco_min !== undefined && price < filters.preco_min) {
        return false;
      }
      if (filters.preco_max !== undefined && price > filters.preco_max) {
        return false;
      }

      // Filtro por método de pagamento
      if (filters.metodo_pagamento && filters.metodo_pagamento.length > 0) {
        if (!filters.metodo_pagamento.includes(budget.payment_condition)) {
          return false;
        }
      }

      // Filtro por entrega
      if (filters.inclui_entrega !== undefined && budget.includes_delivery !== filters.inclui_entrega) {
        return false;
      }

      // Filtro por película
      if (filters.inclui_pelicula !== undefined && budget.includes_screen_protector !== filters.inclui_pelicula) {
        return false;
      }

      // Filtro por validade (calcular dias restantes)
      if (filters.validade_min !== undefined || filters.validade_max !== undefined) {
        const validUntil = budget.valid_until ? new Date(budget.valid_until) : null;
        if (validUntil) {
          const daysRemaining = Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (filters.validade_min !== undefined && daysRemaining < filters.validade_min) {
            return false;
          }
          if (filters.validade_max !== undefined && daysRemaining > filters.validade_max) {
            return false;
          }
        }
      }

      return true;
    });
  }, []);

  const exportBudgets = useCallback(async (options: ExportOptions = {}): Promise<void> => {
    if (isLoading) {
      toast({
        title: "Aguarde",
        description: "Carregando dados dos orçamentos...",
        variant: "destructive",
      });
      return;
    }

    if (!budgets || budgets.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há orçamentos disponíveis para exportação",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Aplicar filtros
      const filteredBudgets = applyFilters(budgets, options.filters);

      if (filteredBudgets.length === 0) {
        toast({
          title: "Nenhum registro encontrado",
          description: "Os filtros aplicados não retornaram nenhum resultado",
          variant: "destructive",
        });
        return;
      }

      // Log dos dados originais do banco
      console.log('🗄️ Primeiros dados do banco:', {
        count: filteredBudgets.length,
        firstBudget: filteredBudgets[0] ? {
          id: filteredBudgets[0].id,
          total_price: filteredBudgets[0].total_price,
          cash_price: filteredBudgets[0].cash_price,
          installment_price: filteredBudgets[0].installment_price,
          device_type: filteredBudgets[0].device_type,
          device_model: filteredBudgets[0].device_model
        } : null
      });

      // Converter orçamentos para formato CSV
      const csvData = filteredBudgets.map(budget => {
        const mappedBudget = BudgetMapper.budgetToCsv({
          id: budget.id,
          client_name: budget.client_name || 'Cliente não informado',
          client_phone: budget.client_phone,
          device_type: budget.device_type,
          device_model: budget.device_model,
          total_price: budget.total_price,
          cash_price: budget.cash_price || budget.total_price,
          installment_price: budget.installment_price || budget.total_price,
          installments: budget.installments || 1,
          payment_condition: budget.payment_condition || 'À Vista',
          warranty_months: budget.warranty_months || 3,
          valid_until: budget.valid_until ? new Date(budget.valid_until) : new Date(),
          part_quality: budget.part_quality,
          notes: budget.notes,
          includes_delivery: budget.includes_delivery || false,
          includes_screen_protector: budget.includes_screen_protector || false,
          created_at: budget.created_at ? new Date(budget.created_at) : new Date(),
          updated_at: budget.updated_at ? new Date(budget.updated_at) : new Date(),
        });
        
        // Log do primeiro mapeamento para debug
        if (budget.id === filteredBudgets[0]?.id) {
          console.log('🔄 Mapeamento CSV:', {
            original_cash_price: budget.cash_price,
            original_total_price: budget.total_price,
            mapped_preco_vista: mappedBudget.preco_vista,
            mapped_preco_parcelado: mappedBudget.preco_parcelado
          });
        }
        
        return mappedBudget;
      });

      // Gerar conteúdo CSV
      const csvContent = CsvFormatter.format(csvData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Download do arquivo
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `onedrip-orcamentos-${timestamp}.csv`;

      if ((navigator as any).msSaveBlob) {
        (navigator as any).msSaveBlob(blob, filename);
      } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Estatísticas da exportação
      const stats: ExportStats = {
        totalBudgets: budgets.length,
        exportedCount: filteredBudgets.length,
        filteredOut: budgets.length - filteredBudgets.length,
        fileSize: formatFileSize(blob.size)
      };

      setExportStats(stats);

      toast({
        title: "Exportação concluída",
        description: `${filteredBudgets.length} orçamentos exportados em ${filename}`,
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [budgets, isLoading, applyFilters, toast]);

  const clearExportStats = useCallback(() => {
    setExportStats(null);
  }, []);

  return {
    isExporting,
    exportStats,
    exportBudgets,
    clearExportStats,
    hasData: budgets && budgets.length > 0,
    totalBudgets: budgets?.length || 0
  };
};