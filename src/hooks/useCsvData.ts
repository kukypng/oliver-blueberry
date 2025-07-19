import * as FileSaver from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { generateExportCsv, generateTemplateCsv, parseAndPrepareBudgets } from '@/utils/csv';

export const useCsvData = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchAndExportBudgets = async () => {
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

      console.log(`=== EXPORTAÇÃO CSV ===`);
      console.log(`Total de orçamentos encontrados: ${budgets.length}`);
      console.log('Orçamentos que serão exportados:', budgets.map(b => ({
        id: b.id,
        device_type: b.device_type,
        device_model: b.device_model,
        part_quality: b.part_quality,
        issue: b.issue,
        qualidade_final: b.part_quality || b.issue || '(vazio)'
      })));

      const csvContent = generateExportCsv(budgets);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, `orcamentos_exportados_${new Date().toISOString().slice(0,10)}.csv`);
      
      toast.dismiss(toastId);
      showSuccess({ title: 'Exportação Concluída', description: 'O arquivo CSV foi baixado com sucesso.' });
    } catch (err: any) {
      toast.dismiss(toastId);
      showError({ title: 'Erro na Exportação', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImportTemplate = () => {
    setIsProcessing(true);
    try {
        const csvContent = generateTemplateCsv();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        FileSaver.saveAs(blob, 'modelo_importacao.csv');
        
        showSuccess({ title: 'Modelo Gerado', description: 'O download do modelo foi iniciado.' });
    } catch (error) {
        console.error("Erro ao gerar modelo:", error);
        showError({ title: 'Erro ao Gerar Modelo', description: 'Não foi possível criar o arquivo de modelo.' });
    } finally {
        setIsProcessing(false);
    }
  };

  const processImportedFile = async (file: File) => {
    setIsProcessing(true);
    const toastId = toast.loading('Processando arquivo...');

    if (!user) {
      toast.dismiss(toastId);
      showError({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para importar dados.' });
      setIsProcessing(false);
      return;
    }

    const importPromise = new Promise(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const newBudgets = parseAndPrepareBudgets(text, user.id);
                
                if (newBudgets.length === 0) {
                  throw new Error("Nenhum orçamento válido encontrado no arquivo. Verifique se os dados obrigatórios foram preenchidos.");
                }

                const { data: insertedData, error } = await supabase
                  .from('budgets')
                  .insert(newBudgets)
                  .select();

                if (error) {
                  console.error("Erro ao salvar no Supabase:", error);
                  throw new Error(`Erro ao salvar os dados: ${error.message}`);
                }

                resolve(insertedData);

            } catch (err: any) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
        reader.readAsText(file, 'UTF-8');
    });

    importPromise
      .then((data) => {
          toast.dismiss(toastId);
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-budgets-for-new'] });
          showSuccess({ title: 'Importação Concluída', description: `${(data as any[]).length} orçamentos foram importados com sucesso.` });
      })
      .catch((err: any) => {
          toast.dismiss(toastId);
          showError({ title: 'Erro na Importação', description: err.message });
      })
      .finally(() => setIsProcessing(false));
  };


  return { isProcessing, fetchAndExportBudgets, downloadImportTemplate, processImportedFile };
};
