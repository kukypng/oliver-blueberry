
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { User, DebugInfo } from '@/types/user';

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToRenew, setUserToRenew] = useState<User | null>(null);
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const { data: debugInfo } = useQuery({
    queryKey: ['debug-current-user'],
    queryFn: async (): Promise<DebugInfo | null> => {
      try {
        const { data, error } = await supabase.rpc('debug_current_user');
        if (error) throw error;
        if (!data || !Array.isArray(data) || data.length === 0) return null;
        const debugData = data[0];
        return {
          user_id: debugData?.user_id || null,
          user_email: debugData?.user_email || null,
          user_role: debugData?.user_role || null,
          is_active: debugData?.is_active || null,
          is_admin: debugData?.is_admin || null,
        };
      } catch (err) {
        return null;
      }
    },
    retry: false,
  });

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase.rpc('admin_get_all_users');
      if (error) throw error;
      if (!data || !Array.isArray(data)) return [];
      return data.map((user: any) => ({
        id: user.id || '',
        name: user.name || 'Nome não disponível',
        email: user.email || 'Email não disponível',
        role: user.role || 'user',
        is_active: Boolean(user.is_active),
        expiration_date: user.expiration_date || new Date().toISOString(),
        created_at: user.created_at || new Date().toISOString(),
        last_sign_in_at: user.last_sign_in_at || null,
        budget_count: user.budget_count || 0,
      }));
    },
    retry: (failureCount: number) => failureCount < 2,
    retryDelay: 1000,
    enabled: !!debugInfo?.is_admin,
  });

  const renewUserLicenseMutation = useMutation({
    mutationFn: async ({ userId, days }: { userId: string, days: number }) => {
      const { data, error } = await supabase.rpc('admin_renew_user_license', {
        p_user_id: userId,
        p_additional_days: days,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showSuccess({
        title: 'Licença Renovada!',
        description: `A licença do usuário foi estendida por ${variables.days} dias.`,
      });
      setUserToRenew(null);
    },
    onError: (error: any) => {
      showError({
        title: 'Erro ao renovar licença',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['debug-current-user'] });
      showSuccess({
        title: 'Usuário deletado',
        description: 'O usuário foi removido permanentemente do sistema.',
      });
      setUserToDelete(null);
    },
    onError: (error: any) => {
      showError({
        title: 'Erro ao deletar usuário',
        description: error.message || 'Ocorreu um erro ao deletar o usuário.',
      });
    },
  });

  const handleRetry = () => refetch();

  const filteredUsers = useMemo(() => {
    return users?.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [users, searchTerm]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleRenew = (user: User) => {
    setUserToRenew(user);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmRenewal = (userId: string, days: number) => {
    if (userToRenew) {
      renewUserLicenseMutation.mutate({ userId, days });
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  return {
    searchTerm, setSearchTerm,
    selectedUser, setSelectedUser,
    isEditModalOpen, setIsEditModalOpen,
    showDebugInfo, setShowDebugInfo,
    userToDelete, setUserToDelete,
    userToRenew, setUserToRenew,
    debugInfo,
    users,
    isLoading,
    error,
    deleteUserMutation,
    renewUserLicenseMutation,
    handleRetry,
    filteredUsers,
    handleEdit,
    handleDelete,
    handleRenew,
    confirmDelete,
    confirmRenewal,
    queryClient,
  };
};
