import React from 'react';
import { BudgetCardWithSwipe } from './BudgetCardWithSwipe';
import { BudgetCardEnhancedV2 } from './BudgetCardEnhancedV2';
import type { Budget } from '../../../types/budget';

interface BudgetCardMobileOptimizedProps {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate: (budgetId: string, updates: Partial<Budget>) => void;
  index?: number;
}

export const BudgetCardMobileOptimized: React.FC<BudgetCardMobileOptimizedProps> = ({
  budget,
  profile,
  isUpdating,
  onShareWhatsApp,
  onViewPDF,
  onDelete,
  onBudgetUpdate,
  index = 0
}) => {
  return (
    <BudgetCardWithSwipe
      budget={budget}
      profile={profile}
      isUpdating={isUpdating}
      onShareWhatsApp={onShareWhatsApp}
      onViewPDF={onViewPDF}
      onDelete={onDelete}
      onBudgetUpdate={onBudgetUpdate}
      index={index}
    >
      {/* Card Redesigned V2 */}
      <BudgetCardEnhancedV2
        budget={budget}
        profile={profile}
        isUpdating={isUpdating}
        onShareWhatsApp={onShareWhatsApp}
        onViewPDF={onViewPDF}
        onDelete={onDelete}
        onBudgetUpdate={onBudgetUpdate}
        index={index}
      />
    </BudgetCardWithSwipe>
  );
};