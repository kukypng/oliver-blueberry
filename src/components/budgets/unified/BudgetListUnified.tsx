import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { BudgetCardUnified } from './BudgetCardUnified';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search } from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';
import { useBudgetsUnified } from './hooks/useBudgetsUnified';
import { useBudgetActions } from './hooks/useBudgetActions';
import { useBudgetFilters } from './hooks/useBudgetFilters';
import { useBudgetSearch } from './hooks/useBudgetSearch';

interface BudgetListUnifiedProps {
  userId: string;
  profile: any;
  onNavigateTo?: (view: string, budgetId?: string) => void;
  variant?: 'desktop' | 'mobile';
  enableVirtualScrolling?: boolean;
  itemHeight?: number;
}

export const BudgetListUnified = ({
  userId,
  profile,
  onNavigateTo,
  variant,
  enableVirtualScrolling = true,
  itemHeight = 280
}: BudgetListUnifiedProps) => {
  const { isMobile } = useLayout();
  const actualVariant = variant || (isMobile ? 'mobile' : 'desktop');

  // Hooks unificados
  const {
    budgets,
    stats,
    loading,
    refreshing,
    error,
    refresh,
    updateBudgetLocal,
    removeBudgetLocal,
    isEmpty,
    hasData
  } = useBudgetsUnified({
    enableRealtime: true,
    cacheTime: 5 * 60 * 1000, // 5 minutos
    limit: 100
  });

  const {
    handleShareWhatsApp,
    handleViewPDF,
    handleDelete,
    handleUpdate,
    getActionState
  } = useBudgetActions({
    onBudgetUpdate: updateBudgetLocal,
    onBudgetDelete: removeBudgetLocal
  });

  const {
    searchTerm,
    setSearchTerm,
    filteredBudgets: searchResults
  } = useBudgetSearch(budgets);

  const {
    activeFilters,
    setFilter,
    clearFilters,
    filteredBudgets: finalBudgets
  } = useBudgetFilters(searchResults);

  // Pull to refresh para mobile
  const handlePullToRefresh = useCallback(() => {
    if (actualVariant === 'mobile') {
      refresh();
    }
  }, [actualVariant, refresh]);

  // Navegação para novo orçamento
  const handleNewBudget = useCallback(() => {
    onNavigateTo?.('new-budget');
  }, [onNavigateTo]);

  // Item renderer para virtual scrolling
  const ItemRenderer = useCallback(({ index, style }: any) => {
    const budget = finalBudgets[index];
    
    return (
      <div style={style} className="px-2">
        <div className="pb-3">
          <BudgetCardUnified
            budget={budget}
            profile={profile}
            variant={actualVariant}
            isGenerating={getActionState(budget.id).isGeneratingPDF}
            onShareWhatsApp={handleShareWhatsApp}
            onViewPDF={handleViewPDF}
            onDelete={handleDelete}
            onBudgetUpdate={handleUpdate}
          />
        </div>
      </div>
    );
  }, [finalBudgets, profile, actualVariant, getActionState, handleShareWhatsApp, handleViewPDF, handleDelete, handleUpdate]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nenhum orçamento encontrado</h3>
              <p className="text-sm">Comece criando seu primeiro orçamento</p>
            </div>
            <Button onClick={handleNewBudget} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Criar Orçamento
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <div className="space-y-4">
      {/* Header com stats e ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {finalBudgets.length} orçamento{finalBudgets.length !== 1 ? 's' : ''}
            </Badge>
            {stats.totalValue > 0 && (
              <Badge variant="outline" className="text-xs">
                Total: R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {actualVariant === 'mobile' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePullToRefresh}
              disabled={refreshing}
              className={cn(refreshing && "animate-spin")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="default"
            size="sm"
            onClick={handleNewBudget}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            {actualVariant === 'mobile' ? '' : 'Novo'}
          </Button>
        </div>
      </div>

      {/* Lista de orçamentos */}
      {enableVirtualScrolling && finalBudgets.length > 10 ? (
        <div style={{ height: `${Math.min(finalBudgets.length * itemHeight, 600)}px` }}>
          <List
            height={Math.min(finalBudgets.length * itemHeight, 600)}
            width="100%"
            itemCount={finalBudgets.length}
            itemSize={itemHeight}
            itemData={finalBudgets}
          >
            {ItemRenderer}
          </List>
        </div>
      ) : (
        <div className="space-y-3">
          {finalBudgets.map((budget) => (
            <BudgetCardUnified
              key={budget.id}
              budget={budget}
              profile={profile}
              variant={actualVariant}
              isGenerating={getActionState(budget.id).isGeneratingPDF}
              onShareWhatsApp={handleShareWhatsApp}
              onViewPDF={handleViewPDF}
              onDelete={handleDelete}
              onBudgetUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* Pull to refresh indicator para mobile */}
      {actualVariant === 'mobile' && refreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Atualizando...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};