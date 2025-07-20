import React from 'react';
import { Filter, X } from 'lucide-react';

interface BudgetFiltersProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  onClearFilters: () => void;
  isAdvancedEnabled?: boolean;
  hasActiveFilters: boolean;
}

const filterOptions = [
  { value: 'all', label: 'Todos', color: 'text-foreground' },
  { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
  { value: 'approved', label: 'Aprovado', color: 'text-blue-600' },
  { value: 'paid', label: 'Pago', color: 'text-green-600' },
  { value: 'delivered', label: 'Entregue', color: 'text-purple-600' },
  { value: 'completed', label: 'Concluído', color: 'text-green-700' },
  { value: 'expired', label: 'Expirado', color: 'text-red-600' },
];

export const BudgetFilters: React.FC<BudgetFiltersProps> = ({
  filterStatus,
  onFilterChange,
  onClearFilters,
  isAdvancedEnabled = false,
  hasActiveFilters
}) => {
  if (!isAdvancedEnabled) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros</span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filterStatus === option.value 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }
            `}
            style={{ touchAction: 'manipulation' }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};