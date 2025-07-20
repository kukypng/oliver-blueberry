
import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedDashboardCard } from './UnifiedDashboardCard';
import { TrendingUp, DollarSign, Target, Clock } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalRevenue: number;
  avgBudgetValue: number;
  completedBudgets: number;
  pendingBudgets: number;
}

interface UnifiedDashboardStatsProps {
  stats: DashboardStats;
  loading?: boolean;
  className?: string;
}

export const UnifiedDashboardStats: React.FC<UnifiedDashboardStatsProps> = ({
  stats,
  loading = false,
  className = ''
}) => {
  const { isMobile } = useDeviceDetection();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statsData = [
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      trend: '+12%',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Valor Médio',
      value: formatCurrency(stats.avgBudgetValue),
      icon: TrendingUp,
      trend: '+5%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Concluídos',
      value: stats.completedBudgets.toString(),
      icon: Target,
      trend: `${stats.completedBudgets} orçamentos`,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pendentes',
      value: stats.pendingBudgets.toString(),
      icon: Clock,
      trend: `${stats.pendingBudgets} aguardando`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
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
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0
    }
  };

  if (loading) {
    return (
      <div className={cn(
        'grid gap-4',
        isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
        className
      )}>
        {[1, 2, 3, 4].map((i) => (
          <UnifiedDashboardCard key={i} loading={true}>
            <div></div>
          </UnifiedDashboardCard>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'grid gap-4',
        isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4',
        className
      )}
      variants={containerAnimations}
      initial="initial"
      animate="animate"
    >
      {statsData.map((stat, index) => (
        <motion.div 
          key={stat.title} 
          variants={itemAnimations}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <UnifiedDashboardCard className="h-full">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className={cn(
                  'font-bold truncate',
                  isMobile ? 'text-lg' : 'text-xl'
                )}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend}
                </p>
              </div>
              <div className={cn(
                'flex-shrink-0 p-3 rounded-xl',
                stat.bgColor
              )}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
          </UnifiedDashboardCard>
        </motion.div>
      ))}
    </motion.div>
  );
};
