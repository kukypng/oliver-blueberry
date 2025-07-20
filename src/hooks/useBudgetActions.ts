import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateWhatsAppMessage, shareViaWhatsApp } from '@/utils/whatsappUtils';
import { SecureRedirect } from '@/utils/secureRedirect';
import type { Budget } from '../types/budget';

export const useBudgetActions = () => {
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  // Compartilhamento WhatsApp
  const handleShareWhatsApp = useCallback(async (budget: Budget) => {
    try {
      // Buscar dados completos do orçamento
      const { data: fullBudget, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budget.id)
        .single();

      if (error) {
        console.error('Erro ao buscar orçamento:', error);
        // Fallback com dados básicos
        const budgetData = {
          id: budget.id,
          device_model: budget.device_model || 'Dispositivo',
          device_type: budget.device_type || 'Smartphone',
          part_type: budget.part_type || 'Serviço',
          part_quality: budget.part_type || 'Reparo geral',
          cash_price: budget.cash_price || budget.total_price || 0,
          installment_price: budget.installment_price || 0,
          installments: budget.installments || 1,
          total_price: budget.total_price || 0,
          warranty_months: budget.warranty_months || 3,
          payment_condition: 'Cartão de Crédito',
          includes_delivery: budget.includes_delivery || false,
          includes_screen_protector: budget.includes_screen_protector || false,
          delivery_date: budget.delivery_date,
          notes: budget.notes,
          status: 'pending',
          workflow_status: budget.workflow_status || 'pending',
          created_at: budget.created_at,
          valid_until: budget.valid_until || budget.expires_at || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: budget.expires_at
        };
        
        const message = generateWhatsAppMessage(budgetData);
        shareViaWhatsApp(message);
      } else {
        // Usar dados completos do banco
        const message = generateWhatsAppMessage({
          ...fullBudget,
          part_quality: fullBudget.part_quality || fullBudget.part_type || 'Reparo'
        });
        shareViaWhatsApp(message);
      }

      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o WhatsApp."
      });
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Ocorreu um erro ao preparar o compartilhamento.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Geração de PDF
  const handleViewPDF = useCallback(async (budget: Budget) => {
    try {
      setUpdating(budget.id);

      // Usar a lógica de PDF existente diretamente
      const budgetData = {
        id: budget.id,
        device_model: budget.device_model || 'Dispositivo',
        device_type: budget.device_type || 'Celular',
        part_quality: budget.part_type || 'Reparo',
        cash_price: budget.cash_price || budget.total_price || 0,
        installment_price: budget.installment_price || 0,
        installments: budget.installments || 1,
        warranty_months: budget.warranty_months || 3,
        created_at: budget.created_at,
        valid_until: budget.valid_until || budget.expires_at || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        client_name: budget.client_name || '',
        client_phone: budget.client_phone || '',
        // Propriedades da loja - valores padrão
        shop_name: 'Minha Loja',
        shop_address: 'Endereço da Loja',
        shop_phone: '(11) 99999-9999'
      };

      // Usar a função de geração de PDF diretamente
      const { generateBudgetPDF } = await import('@/utils/pdfGenerator');
      
      const pdfBlob = await generateBudgetPDF(budgetData);
      
      // Criar URL do blob e abrir
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
      
      // Limpar URL após um tempo
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      toast({
        title: "PDF gerado!",
        description: "O PDF foi aberto em uma nova aba."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  }, [toast]);

  // Exclusão (soft delete)
  const handleDelete = useCallback(async (budgetId: string) => {
    try {
      setUpdating(budgetId);
      
      const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
        p_budget_id: budgetId,
        p_deletion_reason: 'Exclusão via interface mobile'
      });
      
      if (error) throw error;
      
      const response = data as any;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na exclusão do orçamento');
      }
      
      toast({
        title: "Orçamento removido",
        description: "O orçamento foi movido para a lixeira."
      });

      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Não foi possível remover o orçamento.",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(null);
    }
  }, [toast]);

  return {
    updating,
    handleShareWhatsApp,
    handleViewPDF,
    handleDelete
  };
};