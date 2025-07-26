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
export const DashboardLiteStatsEnhanced = ({
  profile,
  userId
}: DashboardLiteStatsEnhancedProps) => {
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
        const {
          data: budgets,
          error
        } = await supabase.from('budgets').select('*').eq('owner_id', userId).is('deleted_at', null);
        if (error) throw error;
        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weeklyBudgets = budgets?.filter(b => new Date(b.created_at) >= weekStart) || [];
        const totalRevenue = budgets?.reduce((sum, b) => sum + (b.cash_price || b.total_price || 0), 0) || 0;
        const pendingBudgets = budgets?.filter(b => b.workflow_status === 'pending').length || 0;
        const completedBudgets = budgets?.filter(b => b.workflow_status === 'completed' || b.is_delivered).length || 0;
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
    return <GlassCard className="p-6 mb-6">
        <AdvancedSkeleton lines={3} avatar />
      </GlassCard>;
  }
  return <div className="space-y-6 mb-6">
      {/* Header com saudação */}
      <GlassCard className="p-6">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {getGreeting()}, {profile?.name || 'usuário'}!
              </h2>
              <p className="text-muted-foreground">Seja bem-vindo(a) de volta</p>
            </div>
            {profile && <BounceBadge variant="default" className="bg-primary/20 text-primary font-semibold">
                {profile.role.toUpperCase()}
              </BounceBadge>}
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
    </div>;
};