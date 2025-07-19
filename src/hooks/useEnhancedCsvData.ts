import { useState, useCallback } from 'react';
import * as FileSaver from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { generateExportCsv, generateTemplateCsv } from '@/utils/csv';
import { EnhancedCsvParser } from '@/utils/csv/enhancedParser';
import { ImportSummary } from '@/utils/csv/validationTypes';

export const useEnhancedCsvData = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportSummary | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchAndExportBudgets = useCallback(async () => {
    setIsProcessing(true);
    const toastId = toast.loading('Exportando orçamentos...');

    if (!user) {
      toast.dismiss(toastId);
      showError({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para exportar dados.' });
      setIsProcessing(false);
      return;
    }

    try {
      // BUSCA TODOS OS ORÇAMENTOS do usuário, incluindo os com campos vazios/zerados
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error('Não foi possível buscar os orçamentos.');

      if (!budgets || budgets.length === 0) {
        toast.dismiss(toastId);
        showWarning({ title: 'Nenhum Orçamento', description: 'Não há dados para exportar.' });
        setIsProcessing(false);
        return;
      }

      console.log(`=== EXPORTAÇÃO CSV APRIMORADA ===`);
      console.log(`Total de orçamentos encontrados: ${budgets.length}`);
      console.log('Orçamentos que serão exportados:', budgets.map(b => ({
        id: b.id,
        device_type: b.device_type,
        device_model: b.device_model,
        part_quality: b.part_quality,
        notes: b.notes,
        qualidade_final: b.part_quality || b.notes || '(vazio)'
      })));

      const csvContent = generateExportCsv(budgets);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, `orcamentos_exportados_${new Date().toISOString().slice(0,10)}.csv`);
      
      toast.dismiss(toastId);
      showSuccess({ 
        title: 'Exportação Concluída', 
        description: `${budgets.length} orçamentos exportados com sucesso.` 
      });
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ title: 'Erro na Exportação', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  }, [user, showSuccess, showError, showWarning]);

  const downloadImportTemplate = useCallback(() => {
    setIsProcessing(true);
    try {
      const csvContent = generateTemplateCsv();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, 'modelo_importacao_aprimorado.csv');
      
      showSuccess({ 
        title: 'Modelo Gerado', 
        description: 'Modelo de importação baixado com instruções detalhadas.' 
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

  const processImportFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    const toastId = toast.loading('Analisando arquivo...');

    if (!user) {
      toast.dismiss(toastId);
      showError({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para importar dados.' });
      setIsProcessing(false);
      return;
    }

    try {
      const text = await file.text();
      const parser = new EnhancedCsvParser();
      const summary = parser.parseAndValidate(text, user.id);
      
      toast.dismiss(toastId);
      setImportPreview(summary);
      
      if (summary.validRows === 0) {
        showError({ 
          title: 'Nenhum Dado Válido', 
          description: 'Não foi possível processar nenhum orçamento válido do arquivo.' 
        });
      } else {
        showSuccess({ 
          title: 'Arquivo Processado', 
          description: `${summary.validRows} orçamento${summary.validRows !== 1 ? 's' : ''} válido${summary.validRows !== 1 ? 's' : ''} encontrado${summary.validRows !== 1 ? 's' : ''}.` 
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ title: 'Erro ao Processar Arquivo', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  }, [user, showSuccess, showError]);

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
      showError({ title: 'Erro na Importação', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  }, [importPreview, user, queryClient, showSuccess, showError]);

  const cancelImport = useCallback(() => {
    setImportPreview(null);
  }, []);

  return {
    isProcessing,
    importPreview,
    fetchAndExportBudgets,
    downloadImportTemplate,
    processImportFile,
    confirmImport,
    cancelImport
  };
};