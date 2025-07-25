
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onClearSearch?: () => void;
  showFilter?: boolean;
  hasActiveFilters?: boolean;
  onFilterToggle?: () => void;
}

export const BudgetSearchBar = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  onKeyPress,
  onClearSearch,
  showFilter = false,
  hasActiveFilters = false,
  onFilterToggle
}: BudgetSearchBarProps) => {
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Card className="glass-card border-0 bg-white/50 dark:bg-black/50 safari-safe-blur animate-scale-in">
      <CardContent className="p-4 lg:p-6">
        <div className="relative">
          <div className={cn(
            "relative flex items-center transition-all duration-300 ease-out",
            "bg-white/50 dark:bg-black/50 border rounded-2xl",
            isFocused 
              ? "border-[#fec832]/50 shadow-lg shadow-[#fec832]/10 bg-white/70 dark:bg-black/70" 
              : "border-white/20 dark:border-black/20 hover:border-white/30 dark:hover:border-black/30"
          )}>
            <Search className={cn(
              "absolute left-4 h-5 w-5 transition-colors duration-200",
              isFocused ? "text-[#fec832]" : "text-muted-foreground/70"
            )} />
            
            <input
              type={isIOS ? "text" : "search"}
              inputMode={isIOS ? "text" : "search"}
              autoComplete="off"
              spellCheck={false}
              aria-label="Buscar por cliente, dispositivo ou problema"
              placeholder="Buscar por cliente, dispositivo ou problema..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={onKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "w-full pl-12 pr-16 py-4 bg-transparent text-foreground",
                "placeholder-muted-foreground/60 focus:outline-none",
                "transition-all duration-200 h-12 text-base lg:text-sm",
                "safari-safe-input"
              )}
              style={{ 
                fontSize: isIOS ? '16px' : 'inherit',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {showFilter && (
                <button
                  type="button"
                  onClick={onFilterToggle}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200 active:scale-95",
                    hasActiveFilters 
                      ? "bg-[#fec832] text-black shadow-sm" 
                      : "hover:bg-muted/50 text-muted-foreground"
                  )}
                  style={{ touchAction: 'manipulation' }}
                >
                  <Filter className="h-4 w-4" />
                </button>
              )}
              
              {searchTerm && onClearSearch && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground/70 hover:text-foreground transition-all duration-200 active:scale-95"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              <Button
                onClick={onSearch}
                size="sm"
                className="h-10 px-4 bg-[#fec832] hover:bg-[#fec832]/90 text-black rounded-xl font-medium shadow-lg hover:shadow-xl safari-safe-transition safari-safe-scale ml-1"
              >
                <Search className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Buscar</span>
              </Button>
            </div>
          </div>
          
          {/* Focus ring indicator */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none",
            isFocused ? "ring-2 ring-[#fec832]/20 ring-offset-2 ring-offset-background" : ""
          )} />
        </div>
      </CardContent>
    </Card>
  );
};
