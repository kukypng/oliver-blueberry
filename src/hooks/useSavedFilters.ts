import { useState, useCallback, useEffect } from 'react';
import type { SavedFilter } from '../types/budget';

const SAVED_FILTERS_KEY = 'oliver-saved-filters';

export const useSavedFilters = () => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_FILTERS_KEY);
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error);
    }
  }, []);

  // Salvar filtros no localStorage
  const persistFilters = useCallback((filters: SavedFilter[]) => {
    try {
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
      setSavedFilters(filters);
    } catch (error) {
      console.error('Erro ao salvar filtros:', error);
    }
  }, []);

  // Salvar filtro atual
  const saveCurrentFilter = useCallback((
    name: string,
    filters: SavedFilter['filters'],
    isFavorite = false
  ) => {
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
      isFavorite
    };

    const updatedFilters = [...savedFilters, newFilter];
    persistFilters(updatedFilters);
    return newFilter;
  }, [savedFilters, persistFilters]);

  // Aplicar filtro salvo
  const applyFilter = useCallback((filterId: string) => {
    return savedFilters.find(f => f.id === filterId);
  }, [savedFilters]);

  // Remover filtro
  const removeFilter = useCallback((filterId: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    persistFilters(updatedFilters);
  }, [savedFilters, persistFilters]);

  // Marcar/desmarcar como favorito
  const toggleFavorite = useCallback((filterId: string) => {
    const updatedFilters = savedFilters.map(f => 
      f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f
    );
    persistFilters(updatedFilters);
  }, [savedFilters, persistFilters]);

  // Renomear filtro
  const renameFilter = useCallback((filterId: string, newName: string) => {
    const updatedFilters = savedFilters.map(f => 
      f.id === filterId ? { ...f, name: newName } : f
    );
    persistFilters(updatedFilters);
  }, [savedFilters, persistFilters]);

  // Filtros favoritos
  const favoriteFilters = savedFilters.filter(f => f.isFavorite);

  return {
    savedFilters,
    favoriteFilters,
    saveCurrentFilter,
    applyFilter,
    removeFilter,
    toggleFavorite,
    renameFilter
  };
};