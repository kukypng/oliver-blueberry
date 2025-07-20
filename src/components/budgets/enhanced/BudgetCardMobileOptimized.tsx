import React from 'react';
import { BudgetCardWithSwipe } from './BudgetCardWithSwipe';
import { BudgetLiteCardiOS } from '../../lite/BudgetLiteCardiOS';
import type { Budget } from '../../../hooks/useBudgetSearch';

interface BudgetCardMobileOptimizedProps {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate: (updates: Partial<Budget>) => void;
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
      {/* Card Content Otimizado para Touch */}
      <div 
        className="p-4 touch-manipulation"
        style={{
          // Otimizações iOS específicas
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'manipulation'
        }}
      >
        <BudgetLiteCardiOS 
          budget={budget} 
          profile={profile} 
          onShareWhatsApp={onShareWhatsApp} 
          onDelete={onDelete} 
          onBudgetUpdate={onBudgetUpdate} 
        />
      </div>
      
      {/* Touch Target Indicators */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-30">
        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
      </div>
    </BudgetCardWithSwipe>
  );
};