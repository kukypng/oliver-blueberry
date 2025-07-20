import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Budget } from './useBudgetSearch';

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

  const handleBudgetUpdate = useCallback((budgetId: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === budgetId ? { ...budget, ...updates } : budget
    ));

    // Refresh após update
    setTimeout(() => {
      fetchBudgets(true);
    }, 500);
  }, [fetchBudgets]);

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