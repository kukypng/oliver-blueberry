import React from 'react';
import { User, Smartphone, DollarSign, Clock, Check } from 'lucide-react';
import type { Budget } from '../../../types/budget';

interface BudgetCardMobileSimplifiedProps {
  budget: Budget;
  isUpdating: boolean;
}

export const BudgetCardMobileSimplified: React.FC<BudgetCardMobileSimplifiedProps> = ({
  budget,
  isUpdating
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'approved':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'approved':
      case 'completed':
        return <Check className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const isExpired = budget.expires_at && new Date(budget.expires_at) < new Date();

  return (
    <div className={`
      relative rounded-xl border bg-card p-4 transition-all duration-200
      ${isUpdating ? 'opacity-60' : 'opacity-100'}
      ${isExpired ? 'border-red-200 bg-red-50/20 dark:border-red-800 dark:bg-red-950/20' : 'border-border'}
    `}>
      {/* Header compacto */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-semibold text-foreground truncate text-sm">
              {budget.client_name || 'Cliente'}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Smartphone className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {budget.device_type || 'Dispositivo'}
            </span>
          </div>
        </div>

        {/* Status compacto */}
        <div className={`
          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          ${getStatusColor(budget.workflow_status || 'pending')}
        `}>
          {getStatusIcon(budget.workflow_status || 'pending')}
          <span className="hidden sm:inline">
            {budget.workflow_status === 'pending' ? 'Pendente' : 
             budget.workflow_status === 'approved' ? 'Aprovado' : 
             budget.workflow_status === 'completed' ? 'Concluído' : 'Pendente'}
          </span>
        </div>
      </div>

      {/* Preço e data em linha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600 shrink-0" />
          <div>
            <div className="font-bold text-foreground">
              {formatCurrency(budget.total_price || 0)}
            </div>
            {budget.cash_price && budget.cash_price < (budget.total_price || 0) && (
              <div className="text-xs text-green-600">
                À vista: {formatCurrency(budget.cash_price)}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {formatDate(budget.created_at)}
          </div>
          {isExpired && (
            <div className="text-xs text-red-600 font-medium">
              Expirado
            </div>
          )}
        </div>
      </div>

      {/* Indicadores simples */}
      {(budget.is_paid || budget.is_delivered) && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
          {budget.is_paid && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-950 px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              <span>Pago</span>
            </div>
          )}
          {budget.is_delivered && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              <span>Entregue</span>
            </div>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};