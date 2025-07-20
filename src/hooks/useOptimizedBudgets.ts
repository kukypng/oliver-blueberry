// FASE 2: Hook Unificado e Otimizado para Budgets
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/useToast';

export type Budget = Tables<'budgets'>;

export interface BudgetStats {
  totalBudgets: number;
  deletedBudgets: number;
  pendingBudgets: number;
  approvedBudgets: number;
  completedBudgets: number;
  totalValue: number;
}

export interface OptimizedBudgetsOptions {
  enabled?: boolean;
  limit?: number;
  realtime?: boolean;
  cache?: boolean;
}

export const useOptimizedBudgets = (
  userId: string,
  options: OptimizedBudgetsOptions = {}
) => {
  const {
    enabled = true,
    limit = 50,
    realtime = true,
    cache = true
  } = options;

  const { showError } = useToast();
  const queryClient = useQueryClient();

  // Query otimizada para budgets com cache inteligente
  const budgetsQuery = useQuery({
    queryKey: ['budgets', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          client_name,
          client_phone,
          device_type,
          device_model,
          part_quality,
          status,
          workflow_status,
          total_price,
          cash_price,
          installment_price,
          delivery_date,
          expires_at,
          valid_until,
          created_at,
          updated_at,
          owner_id,
          is_paid,
          is_delivered
        `)
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching budgets:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId && enabled,
    staleTime: cache ? 1000 * 60 * 2 : 0, // 2 min cache
    gcTime: cache ? 1000 * 60 * 5 : 0, // 5 min garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // Disable polling, use realtime instead
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  // Estatísticas derivadas memoizadas
  const stats: BudgetStats = useMemo(() => {
    const budgets = budgetsQuery.data || [];
    
    return {
      totalBudgets: budgets.length,
      deletedBudgets: 0, // Não incluímos deletados na query
      pendingBudgets: budgets.filter(b => b.workflow_status === 'pending').length,
      approvedBudgets: budgets.filter(b => b.workflow_status === 'approved').length,
      completedBudgets: budgets.filter(b => b.workflow_status === 'completed').length,
      totalValue: budgets.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
    };
  }, [budgetsQuery.data]);

  // Refresh otimizado com invalidação seletiva
  const handleRefresh = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ['budgets', userId],
        exact: false
      });
    } catch (error) {
      console.error('Error refreshing budgets:', error);
      showError({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar os orçamentos'
      });
    }
  }, [queryClient, userId, showError]);

  // Real-time subscription otimizada
  useEffect(() => {
    if (!realtime || !userId) return;

    const channel = supabase
      .channel(`budgets-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'budgets',
          filter: `owner_id=eq.${userId}`
        },
        (payload) => {
          // Invalidação seletiva baseada no evento
          queryClient.invalidateQueries({
            queryKey: ['budgets', userId],
            exact: false
          });
          
          // Log para debug
          console.log('Budget realtime update:', payload.eventType);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, realtime, queryClient]);

  // Paginação inteligente (para futuro)
  const loadMore = useCallback(async () => {
    // Implementar paginação quando necessário
    console.log('Load more budgets - not implemented yet');
  }, []);

  return {
    budgets: budgetsQuery.data || [],
    stats,
    loading: budgetsQuery.isLoading,
    error: budgetsQuery.error?.message || null,
    refreshing: budgetsQuery.isFetching && !budgetsQuery.isLoading,
    handleRefresh,
    loadMore,
    // Compatibilidade com hooks antigos
    fetchBudgets: handleRefresh
  };
};