import React, { useState } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface BudgetSearchEnhancedProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  onQuickSearch: (term: string) => void;
  resultCount: number;
  totalValue: number;
  isSearching: boolean;
  searchHistory: string[];
  searchSuggestions: string[];
}

export const BudgetSearchEnhanced: React.FC<BudgetSearchEnhancedProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onQuickSearch,
  resultCount,
  totalValue,
  isSearching,
  searchHistory,
  searchSuggestions
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQuickSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3">
      {/* Campo de busca principal */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="search"
            inputMode="search"
            placeholder="Buscar por cliente, dispositivo, serviço..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full pl-10 pr-10 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            style={{ touchAction: 'manipulation' }}
          />
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sugestões e histórico */}
        {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
            {/* Sugestões baseadas na busca atual */}
            {searchSuggestions.length > 0 && (
              <div className="p-3 border-b border-border">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Sugestões
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Histórico de busca */}
            {searchHistory.length > 0 && !searchTerm && (
              <div className="p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Buscas recentes
                </div>
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(historyItem)}
                    className="block w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {historyItem}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas da busca */}
      {searchTerm && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {isSearching ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                Buscando...
              </span>
            ) : (
              <span>
                {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'} 
                para "{searchTerm}"
              </span>
            )}
          </div>
          {!isSearching && totalValue > 0 && (
            <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {formatCurrency(totalValue)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};