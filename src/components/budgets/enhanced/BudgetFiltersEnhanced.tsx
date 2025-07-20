import React, { useState } from 'react';
import { Filter, X, DollarSign, User, Calendar, ChevronDown } from 'lucide-react';

interface SearchFilters {
  status: string;
  priceRange: { min: number; max: number } | null;
  client: string;
  dateRange: { start: string; end: string } | null;
}

interface BudgetFiltersEnhancedProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
  onClearFilters: () => void;
  isAdvancedEnabled?: boolean;
  hasActiveFilters: boolean;
  uniqueClients: string[];
  suggestedPriceRanges: Array<{ label: string; min: number; max: number }>;
}

const statusOptions = [
  { value: 'all', label: 'Todos', color: 'text-foreground' },
  { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
  { value: 'approved', label: 'Aprovado', color: 'text-blue-600' },
  { value: 'paid', label: 'Pago', color: 'text-green-600' },
  { value: 'delivered', label: 'Entregue', color: 'text-purple-600' },
  { value: 'completed', label: 'Concluído', color: 'text-green-700' },
  { value: 'expired', label: 'Expirado', color: 'text-red-600' },
];

export const BudgetFiltersEnhanced: React.FC<BudgetFiltersEnhancedProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isAdvancedEnabled = false,
  hasActiveFilters,
  uniqueClients,
  suggestedPriceRanges
}) => {
  const [showFilters, setShowFilters] = useState(false);

  if (!isAdvancedEnabled) return null;

  const formatCurrency = (value: number) => {
    if (value === Infinity) return '+';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const activeFilterCount = [
    filters.status !== 'all',
    filters.priceRange !== null,
    filters.client !== 'all',
    filters.dateRange !== null
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
          style={{ touchAction: 'manipulation' }}
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <X className="h-3 w-3" />
            Limpar todos
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
          {/* Filtro por Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Status</div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange('status', option.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${filters.status === option.value 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Faixa de Preço */}
          {suggestedPriceRanges.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Faixa de Preço
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onFilterChange('priceRange', null)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${filters.priceRange === null 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  Todos
                </button>
                {suggestedPriceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => onFilterChange('priceRange', { min: range.min, max: range.max })}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                      }
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtro por Cliente */}
          {uniqueClients.length > 1 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Cliente
              </div>
              <select
                value={filters.client}
                onChange={(e) => onFilterChange('client', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ touchAction: 'manipulation' }}
              >
                <option value="all">Todos os clientes</option>
                {uniqueClients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por Data */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Período
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => onFilterChange('dateRange', 
                  e.target.value ? { 
                    start: e.target.value, 
                    end: filters.dateRange?.end || e.target.value 
                  } : null
                )}
                className="px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ touchAction: 'manipulation' }}
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => onFilterChange('dateRange', 
                  e.target.value && filters.dateRange?.start ? { 
                    start: filters.dateRange.start, 
                    end: e.target.value 
                  } : null
                )}
                className="px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ touchAction: 'manipulation' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};