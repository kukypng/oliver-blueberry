import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchOptions {
  debounceMs?: number;
  searchFields?: string[];
  caseSensitive?: boolean;
}

export const useBudgetSearch = (
  budgets: any[] = [],
  options: SearchOptions = {}
) => {
  const {
    debounceMs = 300,
    searchFields = ['client_name', 'device_model', 'device_type', 'issue'],
    caseSensitive = false
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredBudgets = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return budgets;

    const term = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();
    
    return budgets.filter(budget => {
      try {
        return searchFields.some(field => {
          const value = budget?.[field];
          if (!value || typeof value !== 'string') return false;
          
          const searchValue = caseSensitive ? value : value.toLowerCase();
          return searchValue.includes(term);
        });
      } catch (error) {
        console.warn('Search filter error:', error);
        return false;
      }
    });
  }, [budgets, debouncedSearchTerm, searchFields, caseSensitive]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const hasActiveSearch = useMemo(() => {
    return !!debouncedSearchTerm.trim();
  }, [debouncedSearchTerm]);

  const searchStats = useMemo(() => {
    return {
      total: budgets.length,
      filtered: filteredBudgets.length,
      hasResults: filteredBudgets.length > 0,
      isFiltering: hasActiveSearch
    };
  }, [budgets.length, filteredBudgets.length, hasActiveSearch]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredBudgets,
    clearSearch,
    hasActiveSearch,
    searchStats,
    isSearching: searchTerm !== debouncedSearchTerm
  };
};