
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export const useSecureBudgets = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  const budgetsQuery = useQuery({
    queryKey: ['secure-budgets', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('useSecureBudgets: User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching budgets for user:', user.id);
      
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          client_name,
          client_phone,
          device_type,
          device_model,
          issue,
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
          is_paid,
          is_delivered,
          owner_id
        `)
        .eq('owner_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar orçamentos:', error);
        showError({ 
          title: 'Erro ao carregar dados', 
          description: error.message || 'Erro desconhecido ao carregar orçamentos'
        });
        throw error;
      }
      
      console.log(`Carregados ${data?.length || 0} orçamentos para o usuário`);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Não tentar novamente em casos de erro de autenticação/permissão
      if (error?.message?.includes('Row Level Security') || error?.message?.includes('permission denied')) {
        console.error('Erro de permissão detectado, não tentando novamente:', error);
        return false;
      }
      return failureCount < 2;
    }
  });

  const createBudget = useMutation({
    mutationFn: async (budgetData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          owner_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-budgets'] });
      showSuccess({
        title: 'Orçamento criado',
        description: 'Orçamento criado com sucesso!'
      });
    },
    onError: (error: any) => {
      showError({
        title: 'Erro ao criar orçamento',
        description: error.message
      });
    }
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('owner_id', user.id) // Double security check
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-budgets'] });
      showSuccess({
        title: 'Orçamento atualizado',
        description: 'Orçamento atualizado com sucesso!'
      });
    },
    onError: (error: any) => {
      showError({
        title: 'Erro ao atualizar orçamento',
        description: error.message
      });
    }
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Usar a função RPC segura para exclusão
      const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
        p_budget_id: id,
        p_deletion_reason: 'Exclusão via hook seguro'
      });
      
      if (error) throw error;
      
      const response = data as any;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na exclusão do orçamento');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-budgets'] });
      showSuccess({
        title: 'Orçamento excluído',
        description: 'Orçamento excluído com sucesso!'
      });
    },
    onError: (error: any) => {
      showError({
        title: 'Erro ao excluir orçamento',
        description: error.message
      });
    }
  });

  return {
    budgets: budgetsQuery.data || [],
    isLoading: budgetsQuery.isLoading,
    error: budgetsQuery.error,
    createBudget: createBudget.mutate,
    updateBudget: updateBudget.mutate,
    deleteBudget: deleteBudget.mutate,
    isCreating: createBudget.isPending,
    isUpdating: updateBudget.isPending,
    isDeleting: deleteBudget.isPending
  };
};
