import { useState, useCallback } from 'react';
import * as FileSaver from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { generateExportCsv, generateTemplateCsv } from '@/utils/csv';
import { UnifiedCsvParser } from '@/utils/csv/unifiedParser';
import { ImportSummary } from '@/utils/csv/validationTypes';
import { CsvErrorHandler } from '@/utils/csv/errorHandler';

/**
 * ✅ HOOK UNIFICADO - Consolida useCsvData e useEnhancedCsvData
 * 
 * Resolve problemas críticos:
 * - Duplicação de hooks com lógicas diferentes
 * - Inconsistências na interface de exportação/importação
 * - Falta de tratamento de erro padronizado
 * - Feedback ao usuário limitado
 */
export const useCsvDataUnified = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportSummary | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /**
   * 📤 EXPORTAÇÃO PADRONIZADA
   * Interface única para exportar orçamentos
   */
  const fetchAndExportBudgets = useCallback(async () => {
    setIsProcessing(true);
    const toastId = toast.loading('Exportando orçamentos...');

    if (!user) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro de Autenticação', 
        description: 'Você precisa estar logado para exportar dados.' 
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Buscar todos os orçamentos do usuário
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('owner_id', user.id)
        .is('deleted_at', null) // Apenas orçamentos não excluídos
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Não foi possível buscar os orçamentos.');
      }

      if (!budgets || budgets.length === 0) {
        toast.dismiss(toastId);
        showWarning({ 
          title: 'Nenhum Orçamento', 
          description: 'Não há dados para exportar.' 
        });
        setIsProcessing(false);
        return;
      }

      console.log(`=== EXPORTAÇÃO UNIFICADA ===`);
      console.log(`Orçamentos encontrados: ${budgets.length}`);

      // 💰 Converter valores de centavos para reais na exportação
      const budgetsForExport = budgets.map(budget => ({
        ...budget,
        total_price: budget.total_price / 100,
        cash_price: budget.cash_price / 100,
        installment_price: budget.installment_price ? budget.installment_price / 100 : null
      }));

      const csvContent = generateExportCsv(budgetsForExport);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `orcamentos_${new Date().toISOString().slice(0,10)}.csv`;
      FileSaver.saveAs(blob, fileName);
      
      toast.dismiss(toastId);
      showSuccess({ 
        title: 'Exportação Concluída', 
        description: `${budgets.length} orçamentos exportados com sucesso.` 
      });
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro na Exportação', 
        description: err.message 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, showSuccess, showError, showWarning]);

  /**
   * 📄 DOWNLOAD DE TEMPLATE PADRONIZADO
   */
  const downloadImportTemplate = useCallback(() => {
    setIsProcessing(true);
    
    try {
      const csvContent = generateTemplateCsv();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = 'modelo_importacao_onedrip.csv';
      FileSaver.saveAs(blob, fileName);
      
      showSuccess({ 
        title: 'Modelo Baixado', 
        description: 'Template de importação baixado com instruções detalhadas.' 
      });
    } catch (error) {
      console.error("Erro ao gerar modelo:", error);
      showError({ 
        title: 'Erro ao Gerar Modelo', 
        description: 'Não foi possível criar o arquivo de modelo.' 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [showSuccess, showError]);

  /**
   * 📥 PROCESSAMENTO DE ARQUIVO COM PRÉVIA
   * Interface aprimorada para importação com validação
   */
  const processImportFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    const toastId = toast.loading('Analisando arquivo...');

    if (!user) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro de Autenticação', 
        description: 'Você precisa estar logado para importar dados.' 
      });
      setIsProcessing(false);
      return;
    }

    try {
      const text = await file.text();
      const parser = new UnifiedCsvParser();
      const errorHandler = new CsvErrorHandler();
      
      let summary: ImportSummary;
      
      try {
        summary = parser.parseAndValidate(text, user.id);
      } catch (error: any) {
        errorHandler.addError(
          CsvErrorHandler.ERROR_CODES.INVALID_FILE_FORMAT,
          error.message
        );
        throw new Error(errorHandler.formatUserMessage());
      }
      
      toast.dismiss(toastId);
      setImportPreview(summary);
      
      if (summary.validRows === 0) {
        showError({ 
          title: 'Nenhum Dado Válido', 
          description: 'Não foi possível processar nenhum orçamento válido do arquivo.' 
        });
      } else {
        const message = summary.warnings > 0 
          ? `${summary.validRows} orçamento${summary.validRows !== 1 ? 's' : ''} válido${summary.validRows !== 1 ? 's' : ''} encontrado${summary.validRows !== 1 ? 's' : ''} com ${summary.warnings} aviso${summary.warnings !== 1 ? 's' : ''}.`
          : `${summary.validRows} orçamento${summary.validRows !== 1 ? 's' : ''} válido${summary.validRows !== 1 ? 's' : ''} encontrado${summary.validRows !== 1 ? 's' : ''}.`;
          
        showSuccess({ 
          title: 'Arquivo Processado', 
          description: message
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro ao Processar Arquivo', 
        description: err.message 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, showSuccess, showError]);

  /**
   * ✅ CONFIRMAÇÃO DE IMPORTAÇÃO APRIMORADA
   */
  const confirmImport = useCallback(async () => {
    if (!importPreview || !user) return;

    setIsProcessing(true);
    const toastId = toast.loading('Importando orçamentos...');

    try {
      const { data: insertedData, error } = await supabase
        .from('budgets')
        .insert(importPreview.processedData)
        .select();

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        throw new Error(`Erro ao salvar os dados: ${error.message}`);
      }

      toast.dismiss(toastId);
      
      // Invalidar caches para atualizar interface
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-budgets-for-new'] });
      
      showSuccess({ 
        title: 'Importação Concluída', 
        description: `${insertedData.length} orçamento${insertedData.length !== 1 ? 's' : ''} importado${insertedData.length !== 1 ? 's' : ''} com sucesso.` 
      });
      
      setImportPreview(null);
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro na Importação', 
        description: err.message 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [importPreview, user, queryClient, showSuccess, showError]);

  /**
   * ❌ CANCELAR IMPORTAÇÃO
   */
  const cancelImport = useCallback(() => {
    setImportPreview(null);
  }, []);

  /**
   * 🔄 COMPATIBILIDADE - Método legado para componentes antigos
   * Suporte ao processImportedFile sem prévia (modo direto)
   */
  const processImportedFileLegacy = useCallback(async (file: File) => {
    setIsProcessing(true);
    const toastId = toast.loading('Processando arquivo...');

    if (!user) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro de Autenticação', 
        description: 'Você precisa estar logado para importar dados.' 
      });
      setIsProcessing(false);
      return;
    }

    try {
      const text = await file.text();
      const parser = new UnifiedCsvParser();
      const newBudgets = parser.parseAndPrepareBudgetsLegacy(text, user.id);
      
      if (newBudgets.length === 0) {
        throw new Error("Nenhum orçamento válido encontrado no arquivo. Verifique os dados obrigatórios.");
      }

      const { data: insertedData, error } = await supabase
        .from('budgets')
        .insert(newBudgets)
        .select();

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        throw new Error(`Erro ao salvar os dados: ${error.message}`);
      }

      toast.dismiss(toastId);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-budgets-for-new'] });
      
      showSuccess({ 
        title: 'Importação Concluída', 
        description: `${insertedData.length} orçamentos foram importados com sucesso.` 
      });
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ 
        title: 'Erro na Importação', 
        description: err.message 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, queryClient, showSuccess, showError]);

  return {
    // Estados
    isProcessing,
    importPreview,
    
    // Métodos principais
    fetchAndExportBudgets,
    downloadImportTemplate,
    processImportFile,
    confirmImport,
    cancelImport,
    
    // Compatibilidade
    processImportedFile: processImportedFileLegacy
  };
};

/**
 * 🔄 ALIASES PARA COMPATIBILIDADE
 * Garantem que componentes existentes continuem funcionando
 */
export const useCsvData = useCsvDataUnified;
export const useEnhancedCsvData = useCsvDataUnified;