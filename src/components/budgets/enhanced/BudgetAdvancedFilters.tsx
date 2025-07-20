import React, { useState } from 'react';
import { Filter, X, Calendar, DollarSign, User, ChevronDown, Search, Target } from 'lucide-react';

interface AdvancedSearchFilters {
  status: string;
  priceRange: { min: number; max: number } | null;
  client: string;
  dateRange: { start: string; end: string } | null;
  deviceType: string;
  partType: string;
  paymentStatus: string;
  deliveryStatus: string;
}

interface BudgetAdvancedFiltersProps {
  filters: AdvancedSearchFilters;
  onFilterChange: (key: keyof AdvancedSearchFilters, value: any) => void;
  onClearFilters: () => void;
  isAdvancedEnabled?: boolean;
  hasActiveFilters: boolean;
  uniqueClients: string[];
  uniqueDeviceTypes: string[];
  uniquePartTypes: string[];
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

const paymentStatusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pago' },
  { value: 'pending', label: 'Pendente' },
];

const deliveryStatusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'pending', label: 'Pendente' },
];

export const BudgetAdvancedFilters: React.FC<BudgetAdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isAdvancedEnabled = false,
  hasActiveFilters,
  uniqueClients,
  uniqueDeviceTypes,
  uniquePartTypes,
  suggestedPriceRanges
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('status');

  if (!isAdvancedEnabled) return null;

  const formatCurrency = (value: number) => {
    if (value === Infinity) return '+';
    // Converter de centavos para reais
    const valueInReais = value / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(valueInReais);
  };

  const activeFilterCount = [
    filters.status !== 'all',
    filters.priceRange !== null,
    filters.client !== 'all',
    filters.deviceType !== 'all',
    filters.partType !== 'all',
    filters.paymentStatus !== 'all',
    filters.deliveryStatus !== 'all',
    filters.dateRange !== null
  ].filter(Boolean).length;

  const sections = [
    { id: 'status', label: 'Status', icon: Target },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'client', label: 'Cliente', icon: User },
    { id: 'service', label: 'Serviço', icon: Search },
    { id: 'dates', label: 'Datas', icon: Calendar },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
          style={{ touchAction: 'manipulation' }}
        >
          <Filter className="h-4 w-4" />
          <span>Filtros Avançados</span>
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
        <div className="bg-muted/30 rounded-xl p-4 space-y-4">
          {/* Navegação por seções */}
          <div className="flex flex-wrap gap-2 pb-3 border-b border-border">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${activeSection === section.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  <Icon className="h-3 w-3" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Seção Status */}
          {activeSection === 'status' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Status do Orçamento</h4>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Pagamento</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {paymentStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Entrega</label>
                  <select
                    value={filters.deliveryStatus}
                    onChange={(e) => onFilterChange('deliveryStatus', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {deliveryStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Seção Financeiro */}
          {activeSection === 'financial' && suggestedPriceRanges.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Faixa de Preço</h4>
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

              {/* Faixa personalizada */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Mínimo</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => {
                      const min = Number(e.target.value) || 0;
                      const max = filters.priceRange?.max || 999999;
                      onFilterChange('priceRange', min > 0 ? { min, max } : null);
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Máximo</label>
                  <input
                    type="number"
                    placeholder="999999"
                    value={filters.priceRange?.max === Infinity ? '' : filters.priceRange?.max || ''}
                    onChange={(e) => {
                      const max = Number(e.target.value) || 999999;
                      const min = filters.priceRange?.min || 0;
                      onFilterChange('priceRange', { min, max });
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção Cliente */}
          {activeSection === 'client' && uniqueClients.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Cliente</h4>
              <select
                value={filters.client}
                onChange={(e) => onFilterChange('client', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
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

          {/* Seção Serviço */}
          {activeSection === 'service' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {uniqueDeviceTypes.length > 1 && (
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Tipo de Dispositivo</label>
                    <select
                      value={filters.deviceType}
                      onChange={(e) => onFilterChange('deviceType', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <option value="all">Todos</option>
                      {uniqueDeviceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {uniquePartTypes.length > 1 && (
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Tipo de Serviço</label>
                    <select
                      value={filters.partType}
                      onChange={(e) => onFilterChange('partType', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <option value="all">Todos</option>
                      {uniquePartTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção Datas */}
          {activeSection === 'dates' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Período</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Data inicial</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => onFilterChange('dateRange', 
                      e.target.value ? { 
                        start: e.target.value, 
                        end: filters.dateRange?.end || e.target.value 
                      } : null
                    )}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Data final</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => onFilterChange('dateRange', 
                      e.target.value && filters.dateRange?.start ? { 
                        start: filters.dateRange.start, 
                        end: e.target.value 
                      } : null
                    )}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
              </div>

              {/* Atalhos de período */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Hoje', days: 0 },
                  { label: 'Última semana', days: 7 },
                  { label: 'Último mês', days: 30 },
                  { label: 'Últimos 3 meses', days: 90 }
                ].map((period) => (
                  <button
                    key={period.label}
                    onClick={() => {
                      const today = new Date();
                      const startDate = new Date();
                      startDate.setDate(today.getDate() - period.days);
                      
                      onFilterChange('dateRange', {
                        start: startDate.toISOString().split('T')[0],
                        end: today.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-1.5 bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-lg text-xs font-medium transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};