
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Users, BarChart3, Settings, FileText, Calculator } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface UnifiedQuickActionsProps {
  onNavigateTo?: (view: string, budgetId?: string) => void;
  className?: string;
}

export const UnifiedQuickActions: React.FC<UnifiedQuickActionsProps> = ({
  onNavigateTo,
  className = ''
}) => {
  const { isMobile } = useDeviceDetection();

  const quickActions = [
    {
      title: 'Novo Orçamento',
      subtitle: 'Criar orçamento',
      icon: Plus,
      action: () => onNavigateTo?.('new-budget'),
      primary: true,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary hover:bg-primary/90'
    },
    {
      title: 'Clientes',
      subtitle: 'Gerenciar',
      icon: Users,
      action: () => onNavigateTo?.('clients'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      title: 'Relatórios',
      subtitle: 'Análises',
      icon: BarChart3,
      action: () => onNavigateTo?.('reports'),
      color: 'text-green-600',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20'
    },
    {
      title: 'Calculadora',
      subtitle: 'Ferramentas',
      icon: Calculator,
      action: () => onNavigateTo?.('calculator'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20'
    }
  ];

  const containerAnimations = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimations = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className={cn(
        'grid gap-3',
        isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
        className
      )}
      variants={containerAnimations}
      initial="initial"
      animate="animate"
    >
      {quickActions.map((action, index) => (
        <motion.div
          key={action.title}
          variants={itemAnimations}
        >
          <Button
            onClick={action.action}
            className={cn(
              'h-auto w-full p-4 flex-col gap-2 text-left',
              'transition-all duration-200 touch-target',
              'hover:scale-[1.02] active:scale-[0.98]',
              action.primary ? action.bgColor : `${action.bgColor} text-foreground`
            )}
            variant={action.primary ? 'default' : 'ghost'}
            style={{ touchAction: 'manipulation' }}
          >
            <div className={cn(
              'p-2 rounded-full',
              action.primary ? 'bg-primary-foreground/20' : action.bgColor
            )}>
              <action.icon className={cn(
                'h-5 w-5',
                action.primary ? 'text-primary-foreground' : action.color
              )} />
            </div>
            <div className="space-y-1">
              <p className={cn(
                'font-medium text-sm',
                action.primary ? 'text-primary-foreground' : 'text-foreground'
              )}>
                {action.title}
              </p>
              <p className={cn(
                'text-xs',
                action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
                {action.subtitle}
              </p>
            </div>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};
