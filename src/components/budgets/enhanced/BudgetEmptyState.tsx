import React from 'react';
import { Plus } from 'lucide-react';

interface BudgetEmptyStateProps {
  hasFilters: boolean;
  searchTerm: string;
  filterStatus: string;
  onClearSearch: () => void;
  onClearFilters: () => void;
}

export const BudgetEmptyState: React.FC<BudgetEmptyStateProps> = ({
  hasFilters,
  searchTerm,
  filterStatus,
  onClearSearch,
  onClearFilters
}) => {
  return (
    <div className="text-center py-20">
      <div className="text-7xl mb-6">
        {hasFilters ? '🔍' : '📋'}
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">
        {hasFilters ? 'Nenhum resultado' : 'Nenhum orçamento'}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
        {hasFilters 
          ? 'Tente ajustar sua busca ou filtros para encontrar o que procura' 
          : 'Comece criando seu primeiro orçamento para seus clientes'
        }
      </p>
      
      {hasFilters ? (
        <div className="flex gap-3 justify-center flex-wrap">
          {searchTerm && (
            <button 
              onClick={onClearSearch} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" 
              style={{ touchAction: 'manipulation' }}
            >
              Limpar busca
            </button>
          )}
          {filterStatus !== 'all' && (
            <button 
              onClick={onClearFilters} 
              className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors" 
              style={{ touchAction: 'manipulation' }}
            >
              Remover filtros
            </button>
          )}
        </div>
      ) : (
        <button 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          <Plus className="h-4 w-4" />
          Criar Orçamento
        </button>
      )}
    </div>
  );
};