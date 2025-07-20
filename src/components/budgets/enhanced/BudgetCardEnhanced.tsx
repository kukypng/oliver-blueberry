import React from 'react';
import { BudgetCardRedesigned } from './BudgetCardRedesigned';
import type { Budget } from '../../../types/budget';

interface BudgetCardEnhancedProps {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate: (updates: Partial<Budget>) => void;
  index?: number;
}

export const BudgetCardEnhanced: React.FC<BudgetCardEnhancedProps> = ({
  budget,
  profile,
  isUpdating,
  onShareWhatsApp,
  onDelete,
  onBudgetUpdate,
  index = 0
}) => {
  return (
    <div 
      className={`transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}
      style={{
        transform: 'translateZ(0)', // Force GPU acceleration
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        willChange: 'transform'
      }}
    >
      <BudgetCardRedesigned
        budget={budget}
        profile={profile}
        isUpdating={isUpdating}
      />
    </div>
  );
};