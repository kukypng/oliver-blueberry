import React from 'react';
import { Share, Trash2, FileText } from 'lucide-react';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture';
import type { Budget } from '../../../types/budget';

interface BudgetCardWithSwipeProps {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate: (budgetId: string, updates: Partial<Budget>) => void;
  index?: number;
  children: React.ReactNode;
}

export const BudgetCardWithSwipe: React.FC<BudgetCardWithSwipeProps> = ({
  budget,
  onShareWhatsApp,
  onViewPDF,
  onDelete,
  children,
  isUpdating
}) => {
  const { swipeOffset, handlers, resetSwipe } = useSwipeGesture({
    onSwipeLeft: () => {
      // Ação de deletar (swipe para esquerda)
      if (Math.abs(swipeOffset) > 100) {
        onDelete(budget.id);
      }
    },
    onSwipeRight: () => {
      // Ação de compartilhar (swipe para direita)
      if (Math.abs(swipeOffset) > 100) {
        onShareWhatsApp(budget);
      }
    },
    threshold: 80
  });

  const getActionColor = () => {
    if (swipeOffset > 50) return 'bg-green-500'; // Compartilhar (direita)
    if (swipeOffset < -50) return 'bg-red-500'; // Deletar (esquerda)
    return 'bg-muted';
  };

  const getActionIcon = () => {
    if (swipeOffset > 50) return <Share className="h-5 w-5 text-white" />;
    if (swipeOffset < -50) return <Trash2 className="h-5 w-5 text-white" />;
    return null;
  };

  const getActionText = () => {
    if (swipeOffset > 50) return 'Compartilhar';
    if (swipeOffset < -50) return 'Excluir';
    return '';
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* Ação da direita (compartilhar) */}
        <div className={`
          flex flex-col items-center justify-center w-20 h-full transition-all duration-200
          ${swipeOffset > 30 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        `}>
          <div className="bg-green-500 rounded-full p-3 mb-1">
            <Share className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs text-green-600 font-medium">Compartilhar</span>
        </div>

        {/* Ação da esquerda (deletar) */}
        <div className={`
          flex flex-col items-center justify-center w-20 h-full transition-all duration-200
          ${swipeOffset < -30 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        `}>
          <div className="bg-red-500 rounded-full p-3 mb-1">
            <Trash2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs text-red-600 font-medium">Excluir</span>
        </div>
      </div>

      {/* Card Content */}
      <div
        className={`
          relative bg-card border border-border rounded-xl transition-all duration-200
          ${isUpdating ? 'opacity-50' : 'opacity-100'}
          ${Math.abs(swipeOffset) > 50 ? 'shadow-lg' : 'shadow-sm'}
        `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          willChange: 'transform'
        }}
        {...handlers}
      >
        {children}

        {/* Haptic feedback indicator */}
        {Math.abs(swipeOffset) > 50 && (
          <div className="absolute top-2 right-2">
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${swipeOffset > 0 ? 'bg-green-500' : 'bg-red-500'}
            `} />
          </div>
        )}
      </div>

      {/* Quick Actions Overlay */}
      {Math.abs(swipeOffset) > 30 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
            <span className="text-xs font-medium text-foreground">
              {Math.abs(swipeOffset) > 80 ? 'Solte para ' + getActionText().toLowerCase() : getActionText()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};