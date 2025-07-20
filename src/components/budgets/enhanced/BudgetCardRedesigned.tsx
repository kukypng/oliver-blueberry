import React from 'react';
import { Calendar, Clock, DollarSign, User, Smartphone, Check, AlertCircle, XCircle } from 'lucide-react';
import type { Budget } from '../../../types/budget';
interface BudgetCardRedesignedProps {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
}
export const BudgetCardRedesigned: React.FC<BudgetCardRedesignedProps> = ({
  budget,
  profile,
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
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'approved':
        return <Check className="h-3 w-3" />;
      case 'completed':
        return <Check className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };
  const isExpired = budget.expires_at && new Date(budget.expires_at) < new Date();
  const isHighValue = (budget.total_price || 0) > 1000;
  return <div className={`
      relative overflow-hidden rounded-2xl border bg-card transition-all duration-300
      ${isUpdating ? 'opacity-60 scale-98' : 'opacity-100 scale-100'}
      ${isExpired ? 'border-red-200 bg-red-50/50' : 'border-border hover:border-primary/30'}
      ${isHighValue ? 'ring-1 ring-primary/10' : ''}
      hover:shadow-lg active:scale-98
    `}>
      {/* Header com informações principais */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-primary shrink-0" />
              <h3 className="font-semibold text-foreground truncate">
                {budget.client_name || 'Cliente não informado'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {budget.device_type} {budget.device_model && `• ${budget.device_model}`}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
            ${getStatusColor(budget.workflow_status || 'pending')}
          `}>
            {getStatusIcon(budget.workflow_status || 'pending')}
            <span>{getStatusLabel(budget.workflow_status || 'pending')}</span>
          </div>
        </div>

        {/* Informação do serviço */}
        {budget.part_type && <div className="mb-3 p-2 bg-muted/30 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              {budget.part_type}
            </p>
            {budget.part_quality && <p className="text-xs text-muted-foreground mt-1">
                Qualidade: {budget.part_quality}
              </p>}
          </div>}
      </div>

      {/* Separador visual */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-4" />

      {/* Footer com preço e data */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-bold text-lg text-foreground">
                {formatCurrency(budget.total_price || 0)}
              </div>
              {budget.cash_price && budget.cash_price !== budget.total_price && <div className="text-xs text-green-600">
                  À vista: {formatCurrency(budget.cash_price)}
                </div>}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(budget.created_at)}</span>
            </div>
            {budget.expires_at && <div className={`text-xs ${isExpired ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                {isExpired ? 'Expirado' : `Expira em ${formatDate(budget.expires_at)}`}
              </div>}
          </div>
        </div>

        {/* Indicadores de status */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
          {budget.is_paid && <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              <span>Pago</span>
            </div>}
          {budget.is_delivered && <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              <span>Entregue</span>
            </div>}
          {budget.warranty_months && <div className="text-xs text-muted-foreground">
              {budget.warranty_months}m garantia
            </div>}
        </div>
      </div>

      {/* Overlays especiais */}
      {isHighValue && <div className="absolute top-2 right-2">
          
        </div>}

      {isExpired && <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px] rounded-2xl pointer-events-none" />}

      {/* Loading overlay */}
      {isUpdating && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Atualizando...</span>
          </div>
        </div>}
    </div>;
};