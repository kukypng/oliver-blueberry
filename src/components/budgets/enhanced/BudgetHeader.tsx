import React from 'react';
import { RefreshCw } from 'lucide-react';

interface BudgetHeaderProps {
  itemCount: number;
  searchTerm: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  itemCount,
  searchTerm,
  refreshing,
  onRefresh
}) => {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="px-4 py-3" style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              {searchTerm && ` • "${searchTerm}"`}
            </p>
          </div>
          
          <button 
            onClick={onRefresh} 
            disabled={refreshing} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50" 
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            aria-label="Atualizar lista"
          >
            <RefreshCw className={`h-5 w-5 text-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};