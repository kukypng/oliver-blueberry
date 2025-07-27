import { useState, useCallback } from 'react';
import { CsvBudgetData, CsvImportResult } from '@/types/csv';
import { BudgetMapper, BudgetData } from '@/utils/csv/budgetMapper';
import { CsvValidator } from '@/utils/csv/validator';
import { useSecureBudgets } from '@/hooks/useSecureBudgets';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ImportProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}

export interface ImportStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export const useBudgetImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { user } = useAuth();
  const { createBudget } = useSecureBudgets(user?.id);
  const { toast } = useToast();

  const validateImportData = useCallback((data: CsvBudgetData[]): CsvImportResult => {
    const errors: any[] = [];
    const validData: CsvBudgetData[] = [];

    // Validar duplicatas
    const duplicateErrors = CsvValidator.findDuplicates(data);
    errors.push(...duplicateErrors);

    // Validar cada registro
    data.forEach((item, index) => {
      const rowNumber = index + 2; // +2 para account for header e 0-based index
      
      // Validações básicas
      const basicErrors = CsvValidator.validateBudgetData(item, rowNumber);
      errors.push(...basicErrors);

      // Validações de relacionamento entre campos
      const relationshipErrors = CsvValidator.validateFieldRelationships(item, rowNumber);
      errors.push(...relationshipErrors);

      // Se não há erros críticos, adicionar aos dados válidos
      const criticalErrors = basicErrors.filter(e => 
        ['tipo_aparelho', 'servico_aparelho', 'preco_vista', 'preco_parcelado'].includes(e.field)
      );
      
      if (criticalErrors.length === 0) {
        validData.push(item);
      }
    });

    return {
      success: errors.length === 0,
      data: validData,
      errors,
      totalRows: data.length,
      validRows: validData.length
    };
  }, []);

  const importBudgets = useCallback(async (csvData: CsvBudgetData[]): Promise<ImportStats> => {
    setIsImporting(true);
    setProgress({ total: csvData.length, completed: 0, failed: 0 });

    const stats: ImportStats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    try {
      // Validar dados antes da importação
      const validationResult = validateImportData(csvData);
      
      if (!validationResult.success && validationResult.validRows === 0) {
        throw new Error('Nenhum registro válido encontrado para importação');
      }

      // Processar cada registro válido
      for (let i = 0; i < validationResult.data.length; i++) {
        const csvRecord = validationResult.data[i];
        stats.totalProcessed++;

        try {
          // Atualizar progresso
          setProgress(prev => prev ? {
            ...prev,
            completed: i,
            current: `Importando: ${csvRecord.servico_aparelho}`
          } : null);

          // Converter CSV para formato de orçamento
          const budgetData = BudgetMapper.csvToBudget(csvRecord);

          // Criar orçamento no sistema
          await createBudget({
            client_name: budgetData.client_name,
            client_phone: budgetData.client_phone || '',
            device_type: budgetData.device_type,
            device_model: budgetData.device_model,
            total_price: budgetData.total_price,
            cash_price: budgetData.cash_price,
            installment_price: budgetData.installment_price,
            installments: budgetData.installments,
            payment_condition: budgetData.payment_condition,
            warranty_months: budgetData.warranty_months,
            part_quality: budgetData.part_quality,
            notes: budgetData.notes,
            includes_delivery: budgetData.includes_delivery,
            includes_screen_protector: budgetData.includes_screen_protector,
            valid_until: budgetData.valid_until.toISOString().split('T')[0], // Format as YYYY-MM-DD
          });

          stats.successful++;

          // Pequeno delay para não sobrecarregar o sistema
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          stats.failed++;
          stats.errors.push(`Linha ${i + 2}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          
          console.error(`Erro ao importar registro ${i + 1}:`, error);
        }
      }

      // Estatísticas finais
      stats.skipped = csvData.length - validationResult.validRows;

      // Feedback para o usuário
      if (stats.successful > 0) {
        toast({
          title: "Importação concluída",
          description: `${stats.successful} orçamentos importados com sucesso`,
        });
      }

      if (stats.failed > 0) {
        toast({
          title: "Alguns registros falharam",
          description: `${stats.failed} registros não puderam ser importados`,
          variant: "destructive",
        });
      }

    } catch (error) {
      stats.errors.push(error instanceof Error ? error.message : 'Erro na importação');
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setProgress(null);
      setImportStats(stats);
    }

    return stats;
  }, [createBudget, toast, validateImportData]);

  const clearImportStats = useCallback(() => {
    setImportStats(null);
  }, []);

  return {
    isImporting,
    progress,
    importStats,
    importBudgets,
    validateImportData,
    clearImportStats
  };
};