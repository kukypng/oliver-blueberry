import React from 'react';
import { BudgetCardMobileOptimized } from './BudgetCardMobileOptimized';
import { BudgetEmptyState } from './BudgetEmptyState';
import { BudgetCardSkeleton } from './BudgetCardSkeleton';
import { BudgetCardError } from './BudgetCardError';
import { PullToRefreshContainer } from './PullToRefreshContainer';
import type { Budget } from '../../../hooks/useBudgetSearch';

interface BudgetListMobileOptimizedProps {
  budgets: Budget[];
  profile: any;
  updating: string | null;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => Promise<boolean>;
  onBudgetUpdate: (budgetId: string, updates: Partial<Budget>) => void;
  onRefresh: () => Promise<void>;
  // Loading and error states
  isLoading?: boolean;
  error?: string | null;
  onRetryError?: () => void;
  // Empty state props
  hasFilters: boolean;
  searchTerm: string;
  filterStatus: string;
  onClearSearch: () => void;
  onClearFilters: () => void;
}

export const BudgetListMobileOptimized: React.FC<BudgetListMobileOptimizedProps> = ({
  budgets,
  profile,
  updating,
  onShareWhatsApp,
  onViewPDF,
  onDelete,
  onBudgetUpdate,
  onRefresh,
  isLoading = false,
  error = null,
  onRetryError,
  hasFilters,
  searchTerm,
  filterStatus,
  onClearSearch,
  onClearFilters
}) => {
  // Loading state
  if (isLoading) {
    return (
      <PullToRefreshContainer onRefresh={onRefresh}>
        <BudgetCardSkeleton count={3} />
      </PullToRefreshContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PullToRefreshContainer onRefresh={onRefresh}>
        <BudgetCardError
          error={error}
          onRetry={onRetryError}
        />
      </PullToRefreshContainer>
    );
  }

  // Empty state
  if (budgets.length === 0) {
    return (
      <PullToRefreshContainer onRefresh={onRefresh}>
        <BudgetEmptyState
          hasFilters={hasFilters}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onClearSearch={onClearSearch}
          onClearFilters={onClearFilters}
        />
      </PullToRefreshContainer>
    );
  }

  const handleDelete = async (budgetId: string) => {
    const success = await onDelete(budgetId);
    return success;
  };

  return (
    <PullToRefreshContainer 
      onRefresh={onRefresh}
      className="h-full"
    >
      <div 
        className="space-y-3 pb-6"
        style={{
          // Performance otimizations
          contain: 'layout style paint',
          willChange: 'scroll-position'
        }}
      >
        {budgets.map((budget, index) => (
          <div
            key={budget.id}
            style={{
              // Staggered animation
              animationDelay: `${Math.min(index * 50, 300)}ms`,
              // GPU acceleration
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            className="animate-fade-in"
          >
            <BudgetCardMobileOptimized
              budget={budget}
              profile={profile}
              isUpdating={updating === budget.id}
              onShareWhatsApp={onShareWhatsApp}
              onViewPDF={onViewPDF}
              onDelete={handleDelete}
              onBudgetUpdate={(updates) => onBudgetUpdate(budget.id, updates)}
              index={index}
            />
          </div>
        ))}
        
        {/* iOS Safe Area Spacing */}
        <div 
          className="h-6"
          style={{ height: 'env(safe-area-inset-bottom, 24px)' }}
        />
      </div>
    </PullToRefreshContainer>
  );
};