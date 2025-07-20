import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { useSavedFilters } from './useSavedFilters';
import type { Budget, SearchFilters } from '../types/budget';

interface UseBudgetSearchProps {
  budgets: Budget[];
  profile?: any;
}

export const useBudgetSearchEnhanced = ({ budgets, profile }: UseBudgetSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    status: 'all',
    priceRange: null,
    client: 'all',
    dateRange: null,
    deviceType: 'all',
    partType: 'all',
    paymentStatus: 'all',
    deliveryStatus: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Hook para filtros salvos
  const savedFiltersHook = useSavedFilters();
  
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

  // Tipos únicos para filtros
  const uniqueDeviceTypes = useMemo(() => {
    const types = budgets
      .map(b => b.device_type)
      .filter(Boolean)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    return types.sort();
  }, [budgets]);

  const uniquePartTypes = useMemo(() => {
    const types = budgets
      .map(b => b.part_type)
      .filter(Boolean)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    return types.sort();
  }, [budgets]);

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
      dateRange: null,
      deviceType: 'all',
      partType: 'all',
      paymentStatus: 'all',
      deliveryStatus: 'all'
    });
  }, []);

  const handleQuickSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Aplicar filtro salvo
  const handleApplySavedFilter = useCallback((savedFilter: any) => {
    setSearchTerm(savedFilter.filters.searchTerm);
    // Garantir que o filtro salvo tenha todas as propriedades necessárias
    setFilters({
      status: savedFilter.filters.status || 'all',
      priceRange: savedFilter.filters.priceRange || null,
      client: savedFilter.filters.client || 'all',
      dateRange: savedFilter.filters.dateRange || null,
      deviceType: 'all',
      partType: 'all', 
      paymentStatus: 'all',
      deliveryStatus: 'all'
    });
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

    // Filtro por tipo de dispositivo
    if (filters.deviceType !== 'all') {
      filtered = filtered.filter(b => b.device_type === filters.deviceType);
    }

    // Filtro por tipo de serviço
    if (filters.partType !== 'all') {
      filtered = filtered.filter(b => b.part_type === filters.partType);
    }

    // Filtro por status de pagamento
    if (filters.paymentStatus !== 'all') {
      if (filters.paymentStatus === 'paid') {
        filtered = filtered.filter(b => b.is_paid === true);
      } else if (filters.paymentStatus === 'pending') {
        filtered = filtered.filter(b => b.is_paid === false);
      }
    }

    // Filtro por status de entrega
    if (filters.deliveryStatus !== 'all') {
      if (filters.deliveryStatus === 'delivered') {
        filtered = filtered.filter(b => b.is_delivered === true);
      } else if (filters.deliveryStatus === 'pending') {
        filtered = filtered.filter(b => b.is_delivered === false);
      }
    }

    return filtered;
  }, [budgets, debouncedSearchTerm, filters, profile?.advanced_features_enabled]);

  const hasActiveFilters = useMemo(() => {
    return debouncedSearchTerm.trim() !== '' || 
           filters.status !== 'all' || 
           filters.priceRange !== null || 
           filters.client !== 'all' || 
           filters.dateRange !== null ||
           filters.deviceType !== 'all' ||
           filters.partType !== 'all' ||
           filters.paymentStatus !== 'all' ||
           filters.deliveryStatus !== 'all';
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
    uniqueDeviceTypes,
    uniquePartTypes,
    suggestedPriceRanges,
    searchStats: {
      totalResults: filteredBudgets.length,
      totalValue: filteredBudgets.reduce((sum, b) => sum + (b.total_price || 0), 0)
    },
    // Filtros salvos
    savedFiltersHook,
    handleApplySavedFilter
  };
};