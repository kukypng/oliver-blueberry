import { useState, useMemo, useCallback } from 'react';

interface FilterOptions {
  status?: string[];
  priceRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  isPaid?: boolean;
  isDelivered?: boolean;
}

interface FilterState {
  status: string;
  priceMin: number | null;
  priceMax: number | null;
  dateStart: Date | null;
  dateEnd: Date | null;
  isPaid: boolean | null;
  isDelivered: boolean | null;
  sortBy: 'created_at' | 'total_price' | 'client_name';
  sortOrder: 'asc' | 'desc';
}

const defaultFilterState: FilterState = {
  status: 'all',
  priceMin: null,
  priceMax: null,
  dateStart: null,
  dateEnd: null,
  isPaid: null,
  isDelivered: null,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const useBudgetFilters = (budgets: any[] = []) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  const filteredBudgets = useMemo(() => {
    let result = [...budgets];

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(budget => budget.workflow_status === filters.status);
    }

    // Filter by price range
    if (filters.priceMin !== null) {
      result = result.filter(budget => (budget.total_price || 0) >= filters.priceMin! * 100);
    }
    if (filters.priceMax !== null) {
      result = result.filter(budget => (budget.total_price || 0) <= filters.priceMax! * 100);
    }

    // Filter by date range
    if (filters.dateStart) {
      result = result.filter(budget => 
        new Date(budget.created_at) >= filters.dateStart!
      );
    }
    if (filters.dateEnd) {
      result = result.filter(budget => 
        new Date(budget.created_at) <= filters.dateEnd!
      );
    }

    // Filter by payment status
    if (filters.isPaid !== null) {
      result = result.filter(budget => budget.is_paid === filters.isPaid);
    }

    // Filter by delivery status
    if (filters.isDelivered !== null) {
      result = result.filter(budget => budget.is_delivered === filters.isDelivered);
    }

    // Sort results
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'total_price':
          aValue = a.total_price || 0;
          bValue = b.total_price || 0;
          break;
        case 'client_name':
          aValue = (a.client_name || '').toLowerCase();
          bValue = (b.client_name || '').toLowerCase();
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [budgets, filters]);

  const setFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilterState);
  }, []);

  const resetSort = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }));
  }, []);

  const setPriceRange = useCallback((min: number | null, max: number | null) => {
    setFilters(prev => ({
      ...prev,
      priceMin: min,
      priceMax: max
    }));
  }, []);

  const setDateRange = useCallback((start: Date | null, end: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateStart: start,
      dateEnd: end
    }));
  }, []);

  const toggleSort = useCallback((field: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  // Quick filters
  const quickFilters = useMemo(() => ({
    pending: () => setFilter('status', 'pending'),
    approved: () => setFilter('status', 'approved'),
    completed: () => setFilter('status', 'completed'),
    paid: () => setFilter('isPaid', true),
    unpaid: () => setFilter('isPaid', false),
    delivered: () => setFilter('isDelivered', true),
    notDelivered: () => setFilter('isDelivered', false),
    today: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDateRange(today, tomorrow);
    },
    thisWeek: () => {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      setDateRange(weekStart, weekEnd);
    },
    thisMonth: () => {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setDateRange(monthStart, monthEnd);
    }
  }), [setFilter, setDateRange]);

  const activeFilters = useMemo(() => {
    const active: string[] = [];
    
    if (filters.status !== 'all') active.push(`Status: ${filters.status}`);
    if (filters.priceMin !== null) active.push(`Min: R$ ${filters.priceMin}`);
    if (filters.priceMax !== null) active.push(`Max: R$ ${filters.priceMax}`);
    if (filters.isPaid !== null) active.push(filters.isPaid ? 'Pago' : 'Não pago');
    if (filters.isDelivered !== null) active.push(filters.isDelivered ? 'Entregue' : 'Não entregue');
    if (filters.dateStart) active.push(`A partir de: ${filters.dateStart.toLocaleDateString('pt-BR')}`);
    if (filters.dateEnd) active.push(`Até: ${filters.dateEnd.toLocaleDateString('pt-BR')}`);
    
    return active;
  }, [filters]);

  const filterStats = useMemo(() => {
    return {
      total: budgets.length,
      filtered: filteredBudgets.length,
      hasActiveFilters: activeFilters.length > 0,
      activeCount: activeFilters.length
    };
  }, [budgets.length, filteredBudgets.length, activeFilters.length]);

  return {
    filters,
    filteredBudgets,
    activeFilters,
    filterStats,
    
    // Actions
    setFilter,
    clearFilters,
    resetSort,
    setPriceRange,
    setDateRange,
    toggleSort,
    quickFilters,
    
    // Utils
    hasActiveFilters: filterStats.hasActiveFilters,
    isEmpty: filteredBudgets.length === 0,
    isFiltering: filterStats.hasActiveFilters
  };
};