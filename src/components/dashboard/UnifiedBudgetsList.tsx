
import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedDashboardCard } from './UnifiedDashboardCard';
import { Calendar, DollarSign, User, Smartphone } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface Budget {
  id: string;
  client_name?: string;
  device_model?: string;
  device_type?: string;
  total_price?: number;
  workflow_status?: string;
  created_at: string;
}

interface UnifiedBudgetsListProps {
  budgets: Budget[];
  loading?: boolean;
  onBudgetClick?: (budgetId: string) => void;
  isCompact?: boolean;
  className?: string;
}

export const UnifiedBudgetsList: React.FC<UnifiedBudgetsListProps> = ({
  budgets,
  loading = false,
  onBudgetClick,
  isCompact = false,
  className = ''
}) => {
  const { isMobile } = useDeviceDetection();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'status-badge success';
      case 'approved': return 'status-badge info';
      case 'pending': return 'status-badge warning';
      default: return 'status-badge';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      default: return 'Rascunho';
    }
  };

  const itemAnimations = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum orçamento encontrado
        </h3>
        <p className="text-muted-foreground">
          {isCompact ? 'Crie seu primeiro orçamento' : 'Comece criando um novo orçamento'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {budgets.map((budget, index) => (
        <motion.div
          key={budget.id}
          variants={itemAnimations}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
          className={cn(
            'group flex items-center gap-4 p-4 rounded-xl',
            'bg-muted/30 hover:bg-muted/50 transition-all duration-200',
            'cursor-pointer touch-target',
            onBudgetClick && 'interactive-scale'
          )}
          onClick={() => onBudgetClick?.(budget.id)}
          style={{ touchAction: 'manipulation' }}
        >
          {/* Device Icon */}
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>

          {/* Budget Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-foreground truncate">
                  {budget.client_name || 'Cliente não informado'}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    {budget.device_model || budget.device_type || 'Dispositivo'}
                  </span>
                  {!isCompact && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(budget.created_at)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Status */}
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(budget.total_price || 0)}
                </span>
                <span className={getStatusColor(budget.workflow_status)}>
                  {getStatusText(budget.workflow_status)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
