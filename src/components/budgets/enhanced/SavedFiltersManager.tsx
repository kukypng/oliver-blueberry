import React, { useState } from 'react';
import { Star, Bookmark, Filter, Plus, X, Edit3, Trash2 } from 'lucide-react';
import { useSavedFilters } from '../../../hooks/useSavedFilters';
import type { SavedFilter, SearchFilters } from '../../../types/budget';

interface SavedFiltersManagerProps {
  currentFilters: SearchFilters;
  currentSearchTerm: string;
  onApplyFilter: (filter: SavedFilter) => void;
}

export const SavedFiltersManager: React.FC<SavedFiltersManagerProps> = ({
  currentFilters,
  currentSearchTerm,
  onApplyFilter
}) => {
  const {
    savedFilters,
    favoriteFilters,
    saveCurrentFilter,
    removeFilter,
    toggleFavorite,
    renameFilter
  } = useSavedFilters();

  const [showManager, setShowManager] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const hasActiveFilters = currentSearchTerm.trim() !== '' || 
                          currentFilters.status !== 'all' || 
                          currentFilters.priceRange !== null || 
                          currentFilters.client !== 'all' || 
                          currentFilters.dateRange !== null;

  const handleSaveFilter = () => {
    if (!filterName.trim() || !hasActiveFilters) return;

    saveCurrentFilter(filterName.trim(), {
      ...currentFilters,
      searchTerm: currentSearchTerm
    });

    setFilterName('');
    setShowSaveDialog(false);
  };

  const handleRename = (filterId: string) => {
    if (!editName.trim()) return;
    
    renameFilter(filterId, editName.trim());
    setEditingFilter(null);
    setEditName('');
  };

  const formatFilterDescription = (filter: SavedFilter) => {
    const parts = [];
    if (filter.filters.searchTerm) parts.push(`"${filter.filters.searchTerm}"`);
    if (filter.filters.status !== 'all') parts.push(filter.filters.status);
    if (filter.filters.client !== 'all') parts.push(filter.filters.client);
    if (filter.filters.priceRange) parts.push('faixa de preço');
    if (filter.filters.dateRange) parts.push('período');
    
    return parts.length > 0 ? parts.join(' • ') : 'Filtro básico';
  };

  return (
    <div className="space-y-3">
      {/* Filtros Favoritos (sempre visíveis) */}
      {favoriteFilters.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            Filtros Favoritos
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onApplyFilter(filter)}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <Star className="h-3 w-3 fill-current" />
                <span>{filter.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowManager(!showManager)}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          <Bookmark className="h-4 w-4" />
          <span>Filtros Salvos</span>
          {savedFilters.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {savedFilters.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <Plus className="h-4 w-4" />
            <span>Salvar</span>
          </button>
        )}
      </div>

      {/* Gerenciador de Filtros */}
      {showManager && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Filtros Salvos</h3>
            <button
              onClick={() => setShowManager(false)}
              className="text-muted-foreground hover:text-foreground"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {savedFilters.length === 0 ? (
            <div className="text-center py-6">
              <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum filtro salvo</p>
              <p className="text-xs text-muted-foreground">Configure filtros e clique em "Salvar"</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    {editingFilter === filter.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(filter.id);
                            if (e.key === 'Escape') setEditingFilter(null);
                          }}
                          className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                          autoFocus
                          style={{ touchAction: 'manipulation' }}
                        />
                        <button
                          onClick={() => handleRename(filter.id)}
                          className="text-green-600 hover:text-green-700"
                          style={{ touchAction: 'manipulation' }}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{filter.name}</span>
                          {filter.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatFilterDescription(filter)}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(filter.id)}
                      className={`p-1 rounded ${filter.isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Star className={`h-4 w-4 ${filter.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingFilter(filter.id);
                        setEditName(filter.name);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onApplyFilter(filter)}
                      className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Aplicar
                    </button>

                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog para salvar filtro */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm animate-scale-in">
            <h3 className="font-medium text-foreground mb-4">Salvar Filtro</h3>
            
            <input
              type="text"
              placeholder="Nome do filtro..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveFilter();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mb-4"
              autoFocus
              style={{ touchAction: 'manipulation' }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium"
                style={{ touchAction: 'manipulation' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg text-sm font-medium"
                style={{ touchAction: 'manipulation' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};