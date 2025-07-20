import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';

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

interface SearchFilters {
  status: string;
  priceRange: { min: number; max: number } | null;
  client: string;
  dateRange: { start: string; end: string } | null;
}

export const useBudgetSearchEnhanced = ({ budgets, profile }: UseBudgetSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    status: 'all',
    priceRange: null,
    client: 'all',
    dateRange: null
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Debounce da busca para performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Detectar quando está buscando
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Clientes únicos para filtro
  const uniqueClients = useMemo(() => {
    const clients = budgets
      .map(b => b.client_name)
      .filter(Boolean)
      .filter((client, index, arr) => arr.indexOf(client) === index);
    return clients.sort();
  }, [budgets]);

  // Faixas de preço sugeridas
  const suggestedPriceRanges = useMemo(() => {
    const prices = budgets.map(b => b.total_price || 0).filter(p => p > 0);
    if (prices.length === 0) return [];
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    return [
      { label: 'Até R$ 100', min: 0, max: 100 },
      { label: 'R$ 100 - R$ 500', min: 100, max: 500 },
      { label: 'R$ 500 - R$ 1.000', min: 500, max: 1000 },
      { label: 'Acima de R$ 1.000', min: 1000, max: Infinity }
    ].filter(range => {
      const inRange = prices.some(p => p >= range.min && p <= range.max);
      return inRange;
    });
  }, [budgets]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    
    // Adicionar ao histórico se não estiver vazio e não for duplicado
    if (term.trim() && !searchHistory.includes(term.trim())) {
      setSearchHistory(prev => [term.trim(), ...prev.slice(0, 4)]); // Manter apenas 5 itens
    }
  }, [searchHistory]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      priceRange: null,
      client: 'all',
      dateRange: null
    });
  }, []);

  const handleQuickSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filteredBudgets = useMemo(() => {
    let filtered = budgets;

    // Filtro por termo de busca (com debounce)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(budget => 
        budget.client_name?.toLowerCase().includes(searchLower) || 
        budget.device_model?.toLowerCase().includes(searchLower) || 
        budget.device_type?.toLowerCase().includes(searchLower) ||
        budget.part_type?.toLowerCase().includes(searchLower) ||
        budget.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por status
    if (profile?.advanced_features_enabled && filters.status !== 'all') {
      switch (filters.status) {
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

    // Filtro por faixa de preço
    if (filters.priceRange) {
      filtered = filtered.filter(b => {
        const price = b.total_price || 0;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Filtro por cliente
    if (filters.client !== 'all') {
      filtered = filtered.filter(b => b.client_name === filters.client);
    }

    // Filtro por data
    if (filters.dateRange) {
      filtered = filtered.filter(b => {
        const createdAt = new Date(b.created_at);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return createdAt >= start && createdAt <= end;
      });
    }

    return filtered;
  }, [budgets, debouncedSearchTerm, filters, profile?.advanced_features_enabled]);

  const hasActiveFilters = useMemo(() => {
    return debouncedSearchTerm.trim() !== '' || 
           filters.status !== 'all' || 
           filters.priceRange !== null || 
           filters.client !== 'all' || 
           filters.dateRange !== null;
  }, [debouncedSearchTerm, filters]);

  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const suggestions = new Set<string>();
    const searchLower = searchTerm.toLowerCase();
    
    budgets.forEach(budget => {
      if (budget.client_name?.toLowerCase().includes(searchLower)) {
        suggestions.add(budget.client_name);
      }
      if (budget.device_model?.toLowerCase().includes(searchLower)) {
        suggestions.add(budget.device_model);
      }
      if (budget.device_type?.toLowerCase().includes(searchLower)) {
        suggestions.add(budget.device_type);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [searchTerm, budgets]);

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    filters,
    setFilters: handleFilterChange,
    filteredBudgets,
    handleClearSearch,
    handleClearFilters,
    handleQuickSearch,
    hasActiveFilters,
    isSearching,
    searchHistory,
    searchSuggestions,
    uniqueClients,
    suggestedPriceRanges,
    searchStats: {
      totalResults: filteredBudgets.length,
      totalValue: filteredBudgets.reduce((sum, b) => sum + (b.total_price || 0), 0)
    }
  };
};