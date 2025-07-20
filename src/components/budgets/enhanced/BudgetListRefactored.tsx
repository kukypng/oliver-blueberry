import React from 'react';
import { BudgetHeader } from './BudgetHeader';
import { BudgetSearchEnhanced } from './BudgetSearchEnhanced';
import { BudgetFiltersEnhanced } from './BudgetFiltersEnhanced';
import { BudgetListMobileOptimized } from './BudgetListMobileOptimized';
import { useBudgetData } from '../../../hooks/useBudgetData';
import { useBudgetSearchEnhanced } from '../../../hooks/useBudgetSearchEnhanced';
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

  // Hooks para busca e filtros aprimorados
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredBudgets,
    handleClearSearch,
    handleClearFilters,
    handleQuickSearch,
    hasActiveFilters,
    isSearching,
    searchHistory,
    searchSuggestions,
    uniqueClients,
    suggestedPriceRanges,
    searchStats
  } = useBudgetSearchEnhanced({ budgets, profile });

  // Hooks para ações
  const {
    updating,
    handleShareWhatsApp,
    handleViewPDF,
    handleDelete
  } = useBudgetActions();

  // Pull to refresh otimizado para mobile
  const handlePullRefresh = async () => {
    if (!refreshing) {
      await handleRefresh();
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

      {/* Search e Filters Aprimorados */}
      <div className="px-4 pb-3 space-y-3">
        <BudgetSearchEnhanced
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={handleClearSearch}
          onQuickSearch={handleQuickSearch}
          resultCount={searchStats.totalResults}
          totalValue={searchStats.totalValue}
          isSearching={isSearching}
          searchHistory={searchHistory}
          searchSuggestions={searchSuggestions}
        />
        
        <BudgetFiltersEnhanced
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          isAdvancedEnabled={profile?.advanced_features_enabled}
          hasActiveFilters={hasActiveFilters}
          uniqueClients={uniqueClients}
          suggestedPriceRanges={suggestedPriceRanges}
        />
      </div>

      {/* Content Mobile Otimizado */}
      <div 
        className="flex-1"
        style={{
          height: 'calc(100dvh - 200px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="px-4 h-full">
          <BudgetListMobileOptimized
            budgets={filteredBudgets}
            profile={profile}
            updating={updating}
            onShareWhatsApp={handleShareWhatsApp}
            onViewPDF={handleViewPDF}
            onDelete={handleEnhancedDelete}
            onBudgetUpdate={handleBudgetUpdate}
            onRefresh={handlePullRefresh}
            hasFilters={hasActiveFilters}
            searchTerm={searchTerm}
            filterStatus={filters.status}
            onClearSearch={handleClearSearch}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};