import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Budget {
  id: string;
  client_name?: string;
  device_model?: string;
  device_type?: string;
  issue?: string;
  total_price?: number;
  cash_price?: number;
  installment_price?: number;
  part_quality?: string;
  part_type?: string;
  workflow_status?: string;
  is_paid?: boolean;
  is_delivered?: boolean;
  expires_at?: string;
  approved_at?: string;
  payment_confirmed_at?: string;
  delivery_confirmed_at?: string;
  created_at: string;
  updated_at?: string;
  installments?: number;
  warranty_months?: number;
  includes_delivery?: boolean;
  includes_screen_protector?: boolean;
  valid_until?: string;
  brand?: string;
  owner_id?: string;
  deleted_at?: string | null;
  delivery_date?: string;
  notes?: string;
  client_id?: string;
  client_phone?: string;
}

interface UseBudgetsUnifiedOptions {
  enableRealtime?: boolean;
  cacheTime?: number;
  limit?: number;
}

export const useBudgetsUnified = (options: UseBudgetsUnifiedOptions = {}) => {
  const { 
    enableRealtime = true, 
    cacheTime = 5 * 60 * 1000, // 5 minutos
    limit = 100 
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Cache inteligente - só busca se passou do tempo de cache
  const shouldFetch = useMemo(() => {
    return Date.now() - lastFetch > cacheTime;
  }, [lastFetch, cacheTime]);

  // Fetch otimizado com cache
  const fetchBudgets = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;
    
    // Usar cache se disponível e não forçar refresh
    if (!forceRefresh && !shouldFetch && budgets.length > 0) {
      return;
    }

    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('owner_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setBudgets(data || []);
      setLastFetch(Date.now());
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
  }, [user?.id, shouldFetch, budgets.length, limit, toast]);

  // Subscription em tempo real otimizada
  useEffect(() => {
    if (!user?.id || !enableRealtime) return;

    fetchBudgets();

    let subscription: any = null;
    let debounceTimer: NodeJS.Timeout | null = null;

    const handleRealtimeUpdate = () => {
      // Debounce para evitar múltiplas atualizações
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchBudgets(true);
      }, 1000);
    };

    subscription = supabase
      .channel(`budgets_unified_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budgets',
        filter: `owner_id=eq.${user.id}`
      }, handleRealtimeUpdate)
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [user?.id, enableRealtime, fetchBudgets]);

  // Atualização local otimizada para evitar re-fetches
  const updateBudgetLocal = useCallback((budgetId: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === budgetId 
        ? { ...budget, ...updates, updated_at: new Date().toISOString() }
        : budget
    ));
  }, []);

  // Remoção local otimizada
  const removeBudgetLocal = useCallback((budgetId: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
  }, []);

  // Adicionar orçamento local
  const addBudgetLocal = useCallback((newBudget: Budget) => {
    setBudgets(prev => [newBudget, ...prev]);
  }, []);

  // Refresh manual
  const refresh = useCallback(() => {
    fetchBudgets(true);
  }, [fetchBudgets]);

  // Limpar cache
  const clearCache = useCallback(() => {
    setLastFetch(0);
    setBudgets([]);
  }, []);

  // Stats computadas
  const stats = useMemo(() => {
    const total = budgets.length;
    const pending = budgets.filter(b => b.workflow_status === 'pending').length;
    const completed = budgets.filter(b => b.workflow_status === 'completed').length;
    const totalValue = budgets.reduce((sum, b) => sum + (b.total_price || 0), 0);

    return {
      total,
      pending,
      completed,
      totalValue: totalValue / 100, // Convert from cents
      avgValue: total > 0 ? (totalValue / 100) / total : 0
    };
  }, [budgets]);

  return {
    // Data
    budgets,
    stats,
    
    // States
    loading,
    refreshing,
    error,
    
    // Actions
    refresh,
    fetchBudgets,
    updateBudgetLocal,
    removeBudgetLocal,
    addBudgetLocal,
    clearCache,
    
    // Utils
    isEmpty: budgets.length === 0 && !loading,
    hasData: budgets.length > 0,
    isStale: shouldFetch,
    cacheAge: Date.now() - lastFetch
  };
};