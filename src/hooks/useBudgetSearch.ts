import { useState, useCallback, useMemo } from 'react';

export interface Budget {
  id: string;
  client_name?: string;
  device_model?: string;
  device_type?: string;
  total_price?: number;
  workflow_status?: string;
  is_paid?: boolean;
  is_delivered?: boolean;
  expires_at?: string;
  approved_at?: string;
  payment_confirmed_at?: string;
  delivery_confirmed_at?: string;
  created_at: string;
  installments?: number;
  cash_price?: number;
  installment_price?: number;
  warranty_months?: number;
  includes_delivery?: boolean;
  includes_screen_protector?: boolean;
  valid_until?: string;
  part_type?: string;
  part_quality?: string;
  brand?: string;
  owner_id?: string;
  deleted_at?: string | null;
  delivery_date?: string;
  notes?: string;
}

interface UseBudgetSearchProps {
  budgets: Budget[];
  profile?: any;
}

export const useBudgetSearch = ({ budgets, profile }: UseBudgetSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterStatus('all');
  }, []);

  const filteredBudgets = useMemo(() => {
    let filtered = budgets;

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(budget => 
        budget.client_name?.toLowerCase().includes(searchLower) || 
        budget.device_model?.toLowerCase().includes(searchLower) || 
        budget.device_type?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por status - apenas se funcionalidades avançadas estão habilitadas
    if (profile?.advanced_features_enabled && filterStatus !== 'all') {
      switch (filterStatus) {
        case 'pending':
          filtered = filtered.filter(b => b.workflow_status === 'pending');
          break;
        case 'approved':
          filtered = filtered.filter(b => b.workflow_status === 'approved');
          break;
        case 'paid':
          filtered = filtered.filter(b => b.is_paid === true);
          break;
        case 'delivered':
          filtered = filtered.filter(b => b.is_delivered === true);
          break;
        case 'completed':
          filtered = filtered.filter(b => b.workflow_status === 'completed');
          break;
        case 'expired':
          filtered = filtered.filter(b => {
            if (!b.expires_at) return false;
            return new Date(b.expires_at) < new Date();
          });
          break;
      }
    }

    return filtered;
  }, [budgets, searchTerm, filterStatus, profile?.advanced_features_enabled]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredBudgets,
    handleClearSearch,
    handleClearFilters,
    hasActiveFilters: searchTerm.trim() !== '' || filterStatus !== 'all'
  };
};