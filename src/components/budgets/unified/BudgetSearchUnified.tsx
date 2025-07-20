import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetSearchUnifiedProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  activeFilters: string[];
  onClearFilters: () => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onToggleSort: (field: any) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
}

export const BudgetSearchUnified = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  activeFilters,
  onClearFilters,
  sortBy,
  sortOrder,
  onToggleSort,
  className,
  placeholder = "Buscar por cliente, dispositivo ou problema...",
  showFilters = true
}: BudgetSearchUnifiedProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          inputMode="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSort('created_at')}
            className="flex items-center gap-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            <span className="text-xs">Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSort('total_price')}
            className="flex items-center gap-2"
          >
            {sortBy === 'total_price' && sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            <span className="text-xs">Valor</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSort('client_name')}
            className="flex items-center gap-2"
          >
            {sortBy === 'client_name' && sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            <span className="text-xs">Cliente</span>
          </Button>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtros:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
};