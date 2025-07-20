import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateWhatsAppMessage, shareViaWhatsApp, sharePDFViaWhatsApp } from '@/utils/whatsappUtils';
import { useShopProfile } from '@/hooks/useShopProfile';

interface UseBudgetActionsOptions {
  onBudgetUpdate?: (budgetId: string, updates: any) => void;
  onBudgetDelete?: (budgetId: string) => void;
}

export const useBudgetActions = (options: UseBudgetActionsOptions = {}) => {
  const { onBudgetUpdate, onBudgetDelete } = options;
  const { toast } = useToast();
  const { shopProfile } = useShopProfile();
  
  const [actionStates, setActionStates] = useState<Record<string, {
    isDeleting?: boolean;
    isSharing?: boolean;
    isGeneratingPDF?: boolean;
    isUpdating?: boolean;
  }>>({});

  const setActionState = useCallback((budgetId: string, state: any) => {
    setActionStates(prev => ({
      ...prev,
      [budgetId]: { ...prev[budgetId], ...state }
    }));
  }, []);

  // WhatsApp Share Action
  const handleShareWhatsApp = useCallback(async (budget: any) => {
    const budgetId = budget.id;
    
    try {
      setActionState(budgetId, { isSharing: true });

      // Buscar dados completos se necessário
      let fullBudget = budget;
      if (!budget.client_name || !budget.issue) {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('id', budgetId)
          .single();
        
        if (!error && data) {
          fullBudget = data;
        }
      }

      const message = generateWhatsAppMessage(fullBudget);
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Compartilhado!',
        description: 'Orçamento compartilhado via WhatsApp',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Erro ao compartilhar via WhatsApp:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível compartilhar via WhatsApp',
        variant: 'destructive'
      });
    } finally {
      setActionState(budgetId, { isSharing: false });
    }
  }, [shopProfile, toast, setActionState]);

  // PDF Generation Action
  const handleViewPDF = useCallback(async (budget: any) => {
    const budgetId = budget.id;
    
    try {
      setActionState(budgetId, { isGeneratingPDF: true });

      // Buscar dados completos
      const { data: fullBudget, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      if (error) {
        throw new Error('Não foi possível carregar os dados do orçamento');
      }

      // Gerar PDF
      const { generateBudgetPDF } = await import('@/utils/pdfGenerator');
      
      const budgetData = {
        ...fullBudget,
        shop_name: shopProfile?.shop_name || 'Loja',
        shop_address: shopProfile?.address || '',
        shop_phone: shopProfile?.contact_phone || ''
      };

      const pdfBlob = await generateBudgetPDF(budgetData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Abrir PDF em nova aba
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        throw new Error('Popup bloqueado. Permita popups para visualizar o PDF.');
      }

    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar o PDF',
        variant: 'destructive'
      });
    } finally {
      setActionState(budgetId, { isGeneratingPDF: false });
    }
  }, [shopProfile, toast, setActionState]);

  // Delete Action
  const handleDelete = useCallback(async (budgetId: string) => {
    try {
      setActionState(budgetId, { isDeleting: true });

      const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
        p_budget_id: budgetId,
        p_deletion_reason: 'Exclusão via interface unificada'
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        onBudgetDelete?.(budgetId);
        toast({
          title: 'Sucesso',
          description: 'Orçamento excluído com sucesso',
          variant: 'default'
        });
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao excluir orçamento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o orçamento',
        variant: 'destructive'
      });
    } finally {
      setActionState(budgetId, { isDeleting: false });
    }
  }, [onBudgetDelete, toast, setActionState]);

  // Update Action
  const handleUpdate = useCallback(async (budgetId: string, updates: any) => {
    try {
      setActionState(budgetId, { isUpdating: true });

      const { error } = await supabase
        .from('budgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId);

      if (error) throw error;

      onBudgetUpdate?.(budgetId, updates);
      
      toast({
        title: 'Sucesso',
        description: 'Orçamento atualizado com sucesso',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o orçamento',
        variant: 'destructive'
      });
    } finally {
      setActionState(budgetId, { isUpdating: false });
    }
  }, [onBudgetUpdate, toast, setActionState]);

  // PDF Share Action (iOS)
  const handlePDFShare = useCallback(async (budget: any) => {
    const budgetId = budget.id;
    
    try {
      setActionState(budgetId, { isGeneratingPDF: true });

      // Gerar PDF primeiro
      const { data: fullBudget, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      if (error) throw error;

      const { generateBudgetPDF } = await import('@/utils/pdfGenerator');
      const budgetData = {
        ...fullBudget,
        shop_name: shopProfile?.shop_name || 'Loja',
        shop_address: shopProfile?.address || '',
        shop_phone: shopProfile?.contact_phone || ''
      };
      const pdfBlob = await generateBudgetPDF(budgetData);
      
      // Usar Web Share API se disponível
      if ('share' in navigator) {
        const file = new File([pdfBlob], `orcamento-${fullBudget.id}.pdf`, { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: `Orçamento - ${fullBudget.client_name}`,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento-${fullBudget.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: 'PDF Compartilhado',
        description: 'PDF gerado e compartilhado com sucesso',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Erro ao compartilhar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível compartilhar o PDF',
        variant: 'destructive'
      });
    } finally {
      setActionState(budgetId, { isGeneratingPDF: false });
    }
  }, [shopProfile, toast, setActionState]);

  // Get action state for specific budget
  const getActionState = useCallback((budgetId: string) => {
    return actionStates[budgetId] || {};
  }, [actionStates]);

  return {
    // Actions
    handleShareWhatsApp,
    handleViewPDF,
    handleDelete,
    handleUpdate,
    handlePDFShare,
    
    // States
    getActionState,
    isAnyActionLoading: Object.values(actionStates).some(state => 
      state.isDeleting || state.isSharing || state.isGeneratingPDF || state.isUpdating
    )
  };
};