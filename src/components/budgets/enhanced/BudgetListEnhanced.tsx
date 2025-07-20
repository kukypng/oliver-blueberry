import React from 'react';
import { BudgetCardEnhanced } from './BudgetCardEnhanced';
import { BudgetEmptyState } from './BudgetEmptyState';
import type { Budget } from '../../../hooks/useBudgetSearch';

interface BudgetListEnhancedProps {
  budgets: Budget[];
  profile: any;
  updating: string | null;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => Promise<boolean>;
  onBudgetUpdate: (budgetId: string, updates: Partial<Budget>) => void;
  // Empty state props
  hasFilters: boolean;
  searchTerm: string;
  filterStatus: string;
  onClearSearch: () => void;
  onClearFilters: () => void;
}

export const BudgetListEnhanced: React.FC<BudgetListEnhancedProps> = ({
  budgets,
  profile,
  updating,
  onShareWhatsApp,
  onViewPDF,
  onDelete,
  onBudgetUpdate,
  hasFilters,
  searchTerm,
  filterStatus,
  onClearSearch,
  onClearFilters
}) => {
  const handleDelete = async (budgetId: string) => {
    const success = await onDelete(budgetId);
    // O componente pai já remove da lista se bem-sucedido
    return success;
  };

  if (budgets.length === 0) {
    return (
      <BudgetEmptyState
        hasFilters={hasFilters}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onClearSearch={onClearSearch}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-3">
      {budgets.map((budget, index) => (
        <BudgetCardEnhanced
          key={budget.id}
          budget={budget}
          profile={profile}
          isUpdating={updating === budget.id}
          onShareWhatsApp={onShareWhatsApp}
          onViewPDF={onViewPDF}
          onDelete={handleDelete}
          onBudgetUpdate={(updates) => onBudgetUpdate(budget.id, updates)}
          index={index}
        />
      ))}
      
      {/* Spacing para iOS safe area */}
      <div className="h-6"></div>
    </div>
  );
};