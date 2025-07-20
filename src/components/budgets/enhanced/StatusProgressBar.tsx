import React from 'react';
import { Check, Clock, DollarSign, Truck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StatusProgressBarProps {
  budget: {
    approved_at?: string | null;
    payment_confirmed_at?: string | null;
    delivery_confirmed_at?: string | null;
    status?: string;
    workflow_status?: string;
  };
}
export const StatusProgressBar: React.FC<StatusProgressBarProps> = ({
  budget
}) => {
  const steps = [{
    id: 'approved',
    label: 'Aprovado',
    icon: Check,
    completed: !!budget.approved_at,
    date: budget.approved_at
  }, {
    id: 'paid',
    label: 'Pago',
    icon: DollarSign,
    completed: !!budget.payment_confirmed_at,
    date: budget.payment_confirmed_at
  }, {
    id: 'delivered',
    label: 'Entregue',
    icon: Truck,
    completed: !!budget.delivery_confirmed_at,
    date: budget.delivery_confirmed_at
  }];
  const isCompleted = budget.status === 'completed' || budget.workflow_status === 'completed';
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = completedSteps / steps.length * 100;
  return <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          return;
        })}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted ? <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Orçamento Concluído</span>
            </> : <>
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {completedSteps === 0 && "Aguardando aprovação"}
                {completedSteps === 1 && "Aguardando pagamento"}
                {completedSteps === 2 && "Aguardando entrega"}
              </span>
            </>}
        </div>
        
        {/* Progress Percentage */}
        <div className="text-xs text-muted-foreground">
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Progress Fill Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out" style={{
        width: `${progressPercentage}%`
      }} />
      </div>
    </div>;
};