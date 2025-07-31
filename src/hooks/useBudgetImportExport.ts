import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BudgetExportData {
  tipoAparelho: string;
  servicoAparelho: string;
  qualidade?: string;
  observacoes?: string;
  precoVista: number;
  precoParcelado: number;
  parcelas: number;
  metodoPagamento: string;
  garantiaMeses: number;
  validadeDias: number;
  incluiEntrega: string;
  incluiPelicula: string;
}

interface ImportResults {
  success: number;
  errors: string[];
}

export const useBudgetImportExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);

  const exportBudgets = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Buscar todos os orçamentos do usuário
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('owner_id', user.id)
        .is('deleted_at', null);

      if (error) throw error;

      if (!budgets || budgets.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum orçamento encontrado para exportar",
          variant: "default",
        });
        return;
      }

      // Converter dados para o formato de exportação
      const exportData: BudgetExportData[] = budgets.map(budget => ({
        tipoAparelho: budget.device_type || '',
        servicoAparelho: budget.device_model || '',
        qualidade: budget.part_quality || '',
        observacoes: budget.notes || '',
        precoVista: budget.cash_price || budget.total_price,
        precoParcelado: budget.installment_price || budget.total_price,
        parcelas: budget.installments || 1,
        metodoPagamento: budget.payment_condition || '',
        garantiaMeses: budget.warranty_months || 0,
        validadeDias: budget.valid_until ? 
          Math.ceil((new Date(budget.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
        incluiEntrega: budget.includes_delivery ? 'sim' : 'não',
        incluiPelicula: budget.includes_screen_protector ? 'sim' : 'não'
      }));

      // Criar CSV
      const headers = [
        'Tipo Aparelho',
        'Serviço/Aparelho', 
        'Qualidade',
        'Observações',
        'Preço à Vista',
        'Preço Parcelado',
        'Parcelas',
        'Método de Pagamento',
        'Garantia (meses)',
        'Validade (dias)',
        'Inclui Entrega',
        'Inclui Película'
      ];

      const csvContent = [
        headers.join(';'),
        ...exportData.map(row => [
          row.tipoAparelho,
          row.servicoAparelho,
          row.qualidade || '',
          row.observacoes || '',
          row.precoVista,
          row.precoParcelado,
          row.parcelas,
          row.metodoPagamento,
          row.garantiaMeses,
          row.validadeDias,
          row.incluiEntrega,
          row.incluiPelicula
        ].join(';'))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orcamentos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: `${budgets.length} orçamentos exportados com sucesso!`,
      });

      return true;

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar orçamentos",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const importBudgets = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
      }

      // Pular o cabeçalho
      const dataLines = lines.slice(1);
      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const columns = line.split(';');

        if (columns.length < 12) {
          errors.push(`Linha ${i + 2}: Número insuficiente de colunas (${columns.length}/12)`);
          continue;
        }

        try {
          // Validar dados obrigatórios
          const tipoAparelho = columns[0]?.trim();
          const servicoAparelho = columns[1]?.trim();
          const precoVista = parseFloat(columns[4]?.replace(',', '.') || '0');
          const precoParcelado = parseFloat(columns[5]?.replace(',', '.') || '0');
          const parcelas = parseInt(columns[6] || '1');

          if (!tipoAparelho || !servicoAparelho || precoVista <= 0) {
            errors.push(`Linha ${i + 2}: Dados obrigatórios inválidos`);
            continue;
          }

          // Calcular data de validade
          const validadeDias = parseInt(columns[9] || '0');
          const validUntil = validadeDias > 0 ? 
            new Date(Date.now() + validadeDias * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;

          // Inserir orçamento
          const { error: insertError } = await supabase
            .from('budgets')
            .insert({
              owner_id: user.id,
              device_type: tipoAparelho,
              device_model: servicoAparelho,
              part_quality: columns[2]?.trim() || null,
              notes: columns[3]?.trim() || null,
              cash_price: precoVista,
              installment_price: precoParcelado,
              total_price: precoVista,
              installments: parcelas,
              payment_condition: columns[7]?.trim() || null,
              warranty_months: parseInt(columns[8] || '0'),
              valid_until: validUntil,
              includes_delivery: columns[10]?.toLowerCase().trim() === 'sim',
              includes_screen_protector: columns[11]?.toLowerCase().trim() === 'sim',
              status: 'pending',
              workflow_status: 'pending',
              is_paid: false,
              is_delivered: false
            });

          if (insertError) {
            errors.push(`Linha ${i + 2}: ${insertError.message}`);
          } else {
            successCount++;
          }

        } catch (error) {
          errors.push(`Linha ${i + 2}: Erro ao processar dados - ${error}`);
        }
      }

      const results = { success: successCount, errors };
      setImportResults(results);

      if (successCount > 0) {
        toast({
          title: "Importação concluída",
          description: `${successCount} orçamentos importados com sucesso!`,
        });
      }

      return results;

    } catch (error) {
      console.error('Erro ao importar:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo de importação",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  const clearImportResults = () => {
    setImportResults(null);
  };

  return {
    exportBudgets,
    importBudgets,
    clearImportResults,
    isExporting,
    isImporting,
    importResults
  };
};