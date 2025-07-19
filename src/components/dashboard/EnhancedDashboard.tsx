/**
 * Enhanced Dashboard - Oliver
 * Dashboard aprimorado com design system moderno
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useBudgetData } from '@/hooks/useBudgetData';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Plus,
  Bell,
  Settings,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Importar os novos componentes
import { 
  MetricCard, 
  ActionCard, 
  ListCard, 
  ProgressCard,
  GlassCard 
} from '@/components/ui/modern-cards';
import { FadeInUp, StaggerList, ScaleOnHover } from '@/components/ui/animations';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  NotificationCenter, 
  useNotifications,
  ToastNotification 
} from '@/components/ui/modern-notifications';
import { BottomNavigation, useBottomNavigation, BottomNavigationSpacer } from '@/components/mobile/BottomNavigation';

interface EnhancedDashboardProps {
  onNavigateTo?: (view: string, budgetId?: string) => void;
  activeView?: string;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  onNavigateTo,
  activeView = 'dashboard'
}) => {
  const { user, profile } = useAuth();
  const { budgets, loading } = useBudgetData(user?.id || '');
  const { 
    notifications, 
    addNotification, 
    dismissNotification, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    unreadCount 
  } = useNotifications();
  
  const shouldShowBottomNav = useBottomNavigation();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Calcular métricas dos orçamentos
  const metrics = React.useMemo(() => {
    if (!budgets) return { total: 0, approved: 0, pending: 0, revenue: 0 };
    
    const total = budgets.length;
    const approved = budgets.filter(b => b.status === 'approved').length;
    const pending = budgets.filter(b => b.status === 'pending').length;
    const revenue = budgets
      .filter(b => b.status === 'approved')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    return { total, approved, pending, revenue };
  }, [budgets]);

  // Orçamentos recentes para a lista
  const recentBudgets = React.useMemo(() => {
    if (!budgets) return [];
    
    return budgets
      .slice(0, 5)
      .map(budget => ({
        id: budget.id,
        title: `${budget.device_type} ${budget.device_model}` || 'Orçamento',
        subtitle: budget.client_name || 'Cliente não informado',
        value: `R$ ${(budget.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        status: budget.status === 'approved' ? 'success' as const :
                budget.status === 'pending' ? 'warning' as const : 'info' as const
      }));
  }, [budgets]);

  // Simular notificações de exemplo
  React.useEffect(() => {
    if (budgets && budgets.length > 0) {
      const pendingBudgets = budgets.filter(b => b.status === 'pending');
      if (pendingBudgets.length > 0) {
        addNotification(
          'info',
          'budget',
          'Orçamentos Pendentes',
          `Você tem ${pendingBudgets.length} orçamento(s) aguardando aprovação`,
          [
            {
              label: 'Ver Orçamentos',
              action: () => onNavigateTo?.('budgets')
            }
          ]
        );
      }
    }
  }, [budgets, addNotification, onNavigateTo]);

  const handleNewBudget = () => {
    onNavigateTo?.('budgets', 'new');
    addNotification(
      'success',
      'budget',
      'Novo Orçamento',
      'Redirecionando para criação de orçamento...'
    );
  };

  const handleBudgetClick = (id: string) => {
    onNavigateTo?.('budgets', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Heading level="h1" size="2xl" className="mb-1">
                Olá, {profile?.name?.split(' ')[0] || 'Usuário'}! 👋
              </Heading>
              <Text color="secondary">
                Gerencie sua assistência técnica de forma profissional
              </Text>
            </div>

            <div className="flex items-center gap-3">
              {/* Busca */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar orçamentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 glass-card border-0"
                />
              </div>

              {/* Notificações */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative glass-card border-0"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </Button>

                {/* Dropdown de notificações */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <NotificationCenter
                      notifications={notifications}
                      onDismiss={dismissNotification}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onClearAll={clearAll}
                    />
                  </div>
                )}
              </div>

              {/* Novo Orçamento */}
              <ScaleOnHover>
                <Button onClick={handleNewBudget} className="btn-premium">
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Orçamento
                </Button>
              </ScaleOnHover>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Métricas Principais */}
        <FadeInUp>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Orçamentos"
              value={metrics.total}
              subtitle="Este mês"
              icon={FileText}
              trend={{ value: 12, isPositive: true }}
              color="blue"
            />
            
            <MetricCard
              title="Aprovados"
              value={metrics.approved}
              subtitle={`${metrics.total > 0 ? Math.round((metrics.approved / metrics.total) * 100) : 0}% de conversão`}
              icon={CheckCircle}
              trend={{ value: 8, isPositive: true }}
              color="green"
            />
            
            <MetricCard
              title="Pendentes"
              value={metrics.pending}
              subtitle="Aguardando aprovação"
              icon={Clock}
              color="yellow"
            />
            
            <MetricCard
              title="Faturamento"
              value={`R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Orçamentos aprovados"
              icon={DollarSign}
              trend={{ value: 15, isPositive: true }}
              color="purple"
            />
          </StaggerList>
        </FadeInUp>

        {/* Ações Rápidas */}
        <FadeInUp delay={0.2}>
          <div className="mb-6">
            <Heading level="h2" size="xl" className="mb-4">
              Ações Rápidas
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard
                title="Novo Orçamento"
                description="Criar orçamento para cliente"
                icon={Plus}
                onClick={handleNewBudget}
                color="blue"
                badge="Ctrl+N"
              />
              
              <ActionCard
                title="Ver Orçamentos"
                description="Gerenciar orçamentos existentes"
                icon={FileText}
                onClick={() => onNavigateTo?.('budgets')}
                color="green"
              />
              
              <ActionCard
                title="Clientes"
                description="Gerenciar base de clientes"
                icon={Users}
                onClick={() => onNavigateTo?.('clients')}
                color="purple"
              />
              
              <ActionCard
                title="Relatórios"
                description="Análises e métricas"
                icon={BarChart3}
                onClick={() => onNavigateTo?.('reports')}
                color="indigo"
              />
            </div>
          </div>
        </FadeInUp>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Orçamentos Recentes */}
          <div className="lg:col-span-2">
            <FadeInUp delay={0.3}>
              <ListCard
                title="Orçamentos Recentes"
                items={recentBudgets}
                onItemClick={handleBudgetClick}
                emptyMessage="Nenhum orçamento encontrado"
              />
            </FadeInUp>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FadeInUp delay={0.4}>
              <ProgressCard
                title="Meta Mensal"
                current={metrics.approved}
                total={30}
                subtitle="Orçamentos aprovados"
                color="green"
              />
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <GlassCard variant="premium">
                <div className="space-y-4">
                  <Heading level="h3" size="lg" weight="semibold">
                    Status do Sistema
                  </Heading>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Text size="sm">Sistema Online</Text>
                      </div>
                      <Text size="sm" color="secondary">Ativo</Text>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Text size="sm">Backup Automático</Text>
                      </div>
                      <Text size="sm" color="secondary">Ativo</Text>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <Text size="sm">Licença</Text>
                      </div>
                      <Text size="sm" color="secondary">
                        {profile?.expiration_date && new Date(profile.expiration_date) > new Date() ? 'Ativa' : 'Expirada'}
                      </Text>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeInUp>
          </div>
        </div>
      </div>

      {/* Bottom Navigation para Mobile */}
      {shouldShowBottomNav && (
        <BottomNavigation
          onNewBudget={handleNewBudget}
        />
      )}
      
      {/* Espaçamento para Bottom Navigation */}
      {shouldShowBottomNav && <BottomNavigationSpacer />}

      {/* Toast Notifications */}
      {notifications
        .filter(n => !n.read)
        .slice(0, 3) // Máximo 3 toasts
        .map((notification, index) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
            position="top-right"
          />
        ))}
    </div>
  );
};