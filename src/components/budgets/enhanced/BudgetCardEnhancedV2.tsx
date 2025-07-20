import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Share, FileText, Trash2, Eye, Clock, DollarSign } from 'lucide-react';
import { BudgetCardRedesigned } from './BudgetCardRedesigned';
import type { Budget } from '../../../types/budget';

interface BudgetCardEnhancedV2Props {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate: (updates: Partial<Budget>) => void;
  index?: number;
}

export const BudgetCardEnhancedV2: React.FC<BudgetCardEnhancedV2Props> = ({
  budget,
  profile,
  isUpdating,
  onShareWhatsApp,
  onViewPDF,
  onDelete,
  onBudgetUpdate,
  index = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, callback: () => void) => {
    setActionLoading(action);
    try {
      await callback();
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div 
      className="transition-all duration-300"
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      {/* Card principal */}
      <div className="relative">
        <BudgetCardRedesigned
          budget={budget}
          profile={profile}
          isUpdating={isUpdating}
        />

        {/* Botão de expansão */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border rounded-full p-1.5 hover:bg-muted transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm animate-fade-in">
          {/* Informações detalhadas */}
          <div className="p-4 space-y-3">
            {/* Detalhes do serviço */}
            {budget.notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Observações
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {budget.notes}
                </p>
              </div>
            )}

            {/* Detalhes financeiros */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Detalhes Financeiros
              </h4>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço total:</span>
                  <span className="font-medium">{formatCurrency(budget.total_price || 0)}</span>
                </div>
                {budget.cash_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">À vista:</span>
                    <span className="font-medium text-green-600">{formatCurrency(budget.cash_price)}</span>
                  </div>
                )}
                {budget.installments && budget.installments > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parcelas:</span>
                    <span className="font-medium">{budget.installments}x {formatCurrency((budget.installment_price || budget.total_price || 0) / budget.installments)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h4>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Criado:</span>
                  <span className="font-medium">{formatDate(budget.created_at)}</span>
                </div>
                {budget.approved_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aprovado:</span>
                    <span className="font-medium">{formatDate(budget.approved_at)}</span>
                  </div>
                )}
                {budget.payment_confirmed_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="font-medium">{formatDate(budget.payment_confirmed_at)}</span>
                  </div>
                )}
                {budget.delivery_confirmed_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega:</span>
                    <span className="font-medium">{formatDate(budget.delivery_confirmed_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="border-t border-border bg-muted/20 p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleAction('share', () => onShareWhatsApp(budget))}
                disabled={actionLoading === 'share'}
                className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                {actionLoading === 'share' ? (
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Share className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">Compartilhar</span>
              </button>

              <button
                onClick={() => handleAction('pdf', () => onViewPDF(budget))}
                disabled={actionLoading === 'pdf'}
                className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                {actionLoading === 'pdf' ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">PDF</span>
              </button>

              <button
                onClick={() => handleAction('delete', () => onDelete(budget.id))}
                disabled={actionLoading === 'delete'}
                className="flex flex-col items-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                {actionLoading === 'delete' ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};