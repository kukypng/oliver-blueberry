import React from 'react';
import { BudgetHeader } from './BudgetHeader';
import { BudgetSearchAdvanced } from './BudgetSearchAdvanced';
import { BudgetFilters } from './BudgetFilters';
import { BudgetListEnhanced } from './BudgetListEnhanced';
import { useBudgetData } from '../../../hooks/useBudgetData';
import { useBudgetSearch } from '../../../hooks/useBudgetSearch';
import { useBudgetActions } from '../../../hooks/useBudgetActions';

interface BudgetListRefactoredProps {
  userId: string;
  profile: any;
}

export const BudgetListRefactored: React.FC<BudgetListRefactoredProps> = ({
  userId,
  profile
}) => {
  // Hooks para dados
  const {
    budgets,
    loading,
    error,
    refreshing,
    handleRefresh,
    handleBudgetUpdate,
    removeBudgetFromList
  } = useBudgetData(userId);

  // Hooks para busca e filtros
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredBudgets,
    handleClearSearch,
    handleClearFilters,
    hasActiveFilters
  } = useBudgetSearch({ budgets, profile });

  // Hooks para ações
  const {
    updating,
    handleShareWhatsApp,
    handleViewPDF,
    handleDelete
  } = useBudgetActions();

  // Pull to refresh handler
  const handlePullRefresh = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    // Detect pull to refresh gesture
    if (e.type === 'touchstart' && target.scrollTop === 0) {
      target.dataset.pullStart = e.touches[0].clientY.toString();
    }
    
    if (e.type === 'touchmove') {
      const pullStart = target.dataset.pullStart;
      if (pullStart && target.scrollTop === 0) {
        const pullDistance = e.touches[0].clientY - parseInt(pullStart);
        if (pullDistance > 120 && !refreshing) {
          handleRefresh();
        }
      }
    }
  };

  // Enhanced delete handler
  const handleEnhancedDelete = async (budgetId: string): Promise<boolean> => {
    const success = await handleDelete(budgetId);
    if (success) {
      removeBudgetFromList(budgetId);
    }
    return success;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-destructive text-6xl">⚠️</div>
          <p className="text-destructive text-lg">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors w-full" 
            style={{ touchAction: 'manipulation' }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Header */}
      <BudgetHeader
        itemCount={filteredBudgets.length}
        searchTerm={searchTerm}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Search e Filters */}
      <div className="px-4 pb-3 space-y-3">
        <BudgetSearchAdvanced
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={handleClearSearch}
          resultCount={filteredBudgets.length}
        />
        
        <BudgetFilters
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          onClearFilters={handleClearFilters}
          isAdvancedEnabled={profile?.advanced_features_enabled}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="bg-primary/20 text-primary text-center py-2 text-sm">
          Atualizando...
        </div>
      )}

      {/* Content com scroll otimizado */}
      <div 
        className="overflow-auto" 
        style={{
          WebkitOverflowScrolling: 'touch',
          height: 'calc(100dvh - 200px)',
          overscrollBehavior: 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }} 
        onTouchStart={handlePullRefresh}
        onTouchMove={handlePullRefresh}
      >
        <div className="px-4 py-3">
          <BudgetListEnhanced
            budgets={filteredBudgets}
            profile={profile}
            updating={updating}
            onShareWhatsApp={handleShareWhatsApp}
            onViewPDF={handleViewPDF}
            onDelete={handleEnhancedDelete}
            onBudgetUpdate={handleBudgetUpdate}
            hasFilters={hasActiveFilters}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onClearSearch={handleClearSearch}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};