
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard, AnimatedCounter, BounceBadge } from '@/components/ui/animations/micro-interactions';
import { AdvancedSkeleton } from '@/components/ui/animations/loading-states';
import { StaggerContainer } from '@/components/ui/animations/page-transitions';

interface DashboardLiteStatsEnhancedProps {
  profile: any;
  userId?: string;
}

interface StatsData {
  totalBudgets: number;
  weeklyGrowth: number;
  totalRevenue: number;
  pendingBudgets: number;
  completedBudgets: number;
  averageValue: number;
}

export const DashboardLiteStatsEnhanced = ({ profile, userId }: DashboardLiteStatsEnhancedProps) => {
  const [stats, setStats] = useState<StatsData>({
    totalBudgets: 0,
    weeklyGrowth: 0,
    totalRevenue: 0,
    pendingBudgets: 0,
    completedBudgets: 0,
    averageValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch basic stats
        const { data: budgets, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('owner_id', userId)
          .is('deleted_at', null);

        if (error) throw error;

        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weeklyBudgets = budgets?.filter(b => 
          new Date(b.created_at) >= weekStart
        ) || [];

        const totalRevenue = budgets?.reduce((sum, b) => 
          sum + (b.cash_price || b.total_price || 0), 0
        ) || 0;

        const pendingBudgets = budgets?.filter(b => 
          b.workflow_status === 'pending'
        ).length || 0;

        const completedBudgets = budgets?.filter(b => 
          b.workflow_status === 'completed' || b.is_delivered
        ).length || 0;

        const averageValue = budgets?.length ? totalRevenue / budgets.length : 0;

        setStats({
          totalBudgets: budgets?.length || 0,
          weeklyGrowth: weeklyBudgets.length,
          totalRevenue,
          pendingBudgets,
          completedBudgets,
          averageValue
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (loading) {
    return (
      <GlassCard className="p-6 mb-6">
        <AdvancedSkeleton lines={3} avatar />
      </GlassCard>
    );
  }

  const statCards = [
    {
      title: 'Total de Orçamentos',
      value: stats.totalBudgets,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Esta Semana',
      value: stats.weeklyGrowth,
      icon: stats.weeklyGrowth > 0 ? TrendingUp : TrendingDown,
      color: stats.weeklyGrowth > 0 ? 'text-green-500' : 'text-red-500',
      bgColor: stats.weeklyGrowth > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
    },
    {
      title: 'Faturamento Total',
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      isAmount: true
    },
    {
      title: 'Pendentes',
      value: stats.pendingBudgets,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Concluídos',
      value: stats.completedBudgets,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      isAmount: true
    }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Header com saudação */}
      <GlassCard className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {getGreeting()}, {profile?.name || 'usuário'}!
              </h2>
              <p className="text-muted-foreground">
                Seja bem-vindo(a) de volta ao OneDrip
              </p>
            </div>
            {profile && (
              <BounceBadge 
                variant="default" 
                className="bg-primary/20 text-primary font-semibold"
              >
                {profile.role.toUpperCase()}
              </BounceBadge>
            )}
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Crescimento semanal
              </p>
              <p className="text-lg font-bold text-primary">
                +{stats.weeklyGrowth} orçamentos
              </p>
            </div>
          </div>
        </motion.div>
      </GlassCard>

      {/* Grid de estatísticas */}
      <StaggerContainer className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <GlassCard key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </motion.div>
              </div>
              
              <h3 className="text-xs text-muted-foreground mb-1 line-clamp-2">
                {stat.title}
              </h3>
              
              <div className="text-lg font-bold text-foreground">
                {stat.isAmount ? (
                  <span>{stat.value}</span>
                ) : (
                  <AnimatedCounter 
                    value={typeof stat.value === 'number' ? stat.value : 0} 
                    duration={1.5}
                  />
                )}
              </div>
            </GlassCard>
          );
        })}
      </StaggerContainer>
    </div>
  );
};
