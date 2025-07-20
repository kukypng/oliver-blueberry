
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UnifiedDashboardHeader } from './UnifiedDashboardHeader';
import { UnifiedDashboardCard } from './UnifiedDashboardCard';
import { UnifiedDashboardStats } from './UnifiedDashboardStats';
import { UnifiedBudgetsList } from './UnifiedBudgetsList';
import { UnifiedQuickActions } from './UnifiedQuickActions';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useBudgetData } from '@/hooks/useBudgetData';
import { LicenseStatusCard } from '@/components/license/LicenseStatusCard';
import { Sparkles, ShoppingBag, CreditCard, TrendingUp } from 'lucide-react';

interface UnifiedDashboardContentProps {
  onNavigateTo?: (view: string, budgetId?: string) => void;
  activeView?: string;
  profile?: any;
  isLiteVersion?: boolean;
}

export const UnifiedDashboardContent: React.FC<UnifiedDashboardContentProps> = ({
  onNavigateTo,
  activeView,
  profile,
  isLiteVersion = false
}) => {
  const { isMobile } = useDeviceDetection();
  const { budgets, loading, error, refreshing, handleRefresh } = useBudgetData(profile?.id || '');
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgBudgetValue: 0,
    completedBudgets: 0,
    pendingBudgets: 0
  });

  // Calculate stats from budgets
  useEffect(() => {
    if (budgets && budgets.length > 0) {
      const completed = budgets.filter(b => b.workflow_status === 'completed');
      const pending = budgets.filter(b => b.workflow_status === 'pending');
      const totalRevenue = completed.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const avgBudgetValue = budgets.length > 0 ? budgets.reduce((sum, b) => sum + (b.total_price || 0), 0) / budgets.length : 0;

      setStats({
        totalRevenue,
        avgBudgetValue,
        completedBudgets: completed.length,
        pendingBudgets: pending.length
      });
    }
  }, [budgets]);

  const containerAnimations = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimations = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className="dashboard-content"
      variants={containerAnimations}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={itemAnimations}>
        <UnifiedDashboardHeader
          title="Oliver"
          subtitle={`${isLiteVersion ? 'Painel' : 'Dashboard'} • ${profile?.name || 'Usuário'}`}
          onSettingsClick={() => onNavigateTo?.('settings')}
          onNotificationsClick={() => onNavigateTo?.('notifications')}
        />
      </motion.div>

      {/* Main Content */}
      <div className={`p-4 space-y-6 ${isMobile ? 'pb-safe-bottom' : ''}`}>
        
        {/* Welcome Section */}
        <motion.div variants={itemAnimations}>
          <UnifiedDashboardCard
            title={`Olá, ${profile?.name || 'Usuário'}! 👋`}
            subtitle="Bem-vindo ao seu painel de controle"
            className="mb-6"
          >
            <UnifiedQuickActions 
              onNavigateTo={onNavigateTo}
              className="mt-4"
            />
          </UnifiedDashboardCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemAnimations}>
          <UnifiedDashboardStats
            stats={stats}
            loading={loading}
            className="mb-6"
          />
        </motion.div>

        {/* License Status */}
        <motion.div variants={itemAnimations}>
          <LicenseStatusCard />
        </motion.div>

        {/* Recent Budgets */}
        <motion.div variants={itemAnimations}>
          <UnifiedDashboardCard
            title="Orçamentos Recentes"
            subtitle="Seus últimos orçamentos"
            icon={<ShoppingBag className="h-5 w-5 text-primary" />}
            badge={
              <span className="status-badge info">
                {budgets?.length || 0} total
              </span>
            }
          >
            <UnifiedBudgetsList
              budgets={budgets?.slice(0, 5) || []}
              loading={loading}
              onBudgetClick={(budgetId) => onNavigateTo?.('budget-details', budgetId)}
              isCompact={true}
            />
          </UnifiedDashboardCard>
        </motion.div>

        {/* Additional Features Card */}
        <motion.div variants={itemAnimations}>
          <UnifiedDashboardCard
            title="Recursos Avançados"
            subtitle="Explore todas as funcionalidades"
            icon={<Sparkles className="h-5 w-5 text-primary" />}
            isInteractive={true}
            onClick={() => onNavigateTo?.('features')}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Relatórios</p>
                  <p className="text-xs text-muted-foreground">Análises detalhadas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Clientes</p>
                  <p className="text-xs text-muted-foreground">Gestão completa</p>
                </div>
              </div>
            </div>
          </UnifiedDashboardCard>
        </motion.div>

      </div>
    </motion.div>
  );
};
