import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Budget } from '../types/budget';

interface UseBudgetDataProps {
  userId: string;
}

export const useBudgetData = (userId: string) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch otimizado
  const fetchBudgets = useCallback(async (showRefreshing = false) => {
    if (!userId) return;
    
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setBudgets(data || []);
    } catch (err: any) {
      console.error('Error fetching budgets:', err);
      setError('Erro ao carregar orçamentos');
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os orçamentos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, toast]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    
    fetchBudgets();
    
    let subscription: any = null;
    let debounceTimer: NodeJS.Timeout | null = null;
    
    subscription = supabase
      .channel(`budget_changes_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budgets',
        filter: `owner_id=eq.${userId}`
      }, payload => {
        console.log('Budget change detected:', payload);
        
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
          fetchBudgets();
          debounceTimer = null;
        }, 500);
      })
      .subscribe();
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, fetchBudgets]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    await fetchBudgets(true);
  }, [fetchBudgets, refreshing]);

  const handleBudgetUpdate = useCallback(async (budgetId: string, updates: Partial<Budget>) => {
    try {
      // Primeiro atualiza o estado local para resposta imediata
      setBudgets(prev => prev.map(budget => 
        budget.id === budgetId ? { ...budget, ...updates } : budget
      ));

      // Preparar dados para o banco (convertendo valores para centavos se necessário)
      const updateData: any = { ...updates };
      
      // Converter preços para centavos se presente
      if (updateData.cash_price !== undefined && typeof updateData.cash_price === 'number') {
        updateData.cash_price = Math.round(updateData.cash_price * 100);
      }
      if (updateData.installment_price !== undefined && typeof updateData.installment_price === 'number') {
        updateData.installment_price = Math.round(updateData.installment_price * 100);
      }
      if (updateData.total_price !== undefined && typeof updateData.total_price === 'number') {
        updateData.total_price = Math.round(updateData.total_price * 100);
      }

      // Persistir no banco de dados
      const { error } = await supabase
        .from('budgets')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId);

      if (error) {
        console.error('Error updating budget:', error);
        
        // Reverter mudança local em caso de erro
        await fetchBudgets(true);
        
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Budget updated successfully:', budgetId, updates);
      
      toast({
        description: 'Alteração salva com sucesso!',
      });

    } catch (err: any) {
      console.error('Error in handleBudgetUpdate:', err);
      
      // Reverter mudança local em caso de erro
      await fetchBudgets(true);
      
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao salvar.',
        variant: 'destructive'
      });
    }
  }, [fetchBudgets, toast]);

  const removeBudgetFromList = useCallback((budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  }, []);

  return {
    budgets,
    loading,
    error,
    refreshing,
    fetchBudgets,
    handleRefresh,
    handleBudgetUpdate,
    removeBudgetFromList
  };
};