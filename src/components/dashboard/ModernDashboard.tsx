/**
 * Modern Dashboard - Oliver
 * Dashboard principal com design system atualizado
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react';
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

// Mock data - em produção viria da API
const mockData = {
  metrics: {
    totalBudgets: 156,
    totalClients: 89,
    monthlyRevenue: 45280,
    conversionRate: 68
  },
  recentBudgets: [
    {
      id: '1',
      title: 'iPhone 13 - Tela quebrada',
      subtitle: 'João Silva',
      value: 'R$ 450,00',
      status: 'success' as const
    },
    {
      id: '2',
      title: 'Samsung Galaxy - Bateria',
      subtitle: 'Maria Santos',
      value: 'R$ 280,00',
      status: 'warning' as const
    },
    {
      id: '3',
      title: 'MacBook Pro - Teclado',
      subtitle: 'Pedro Costa',
      value: 'R$ 1.200,00',
      status: 'info' as const
    }
  ],
  weeklyProgress: {
    current: 23,
    total: 30
  }
};

interface ModernDashboardProps {
  onNewBudget?: () => void;
  onViewBudgets?: () => void;
  onViewClients?: () => void;
  onViewReports?: () => void;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  onNewBudget,
  onViewBudgets,
  onViewClients,
  onViewReports
}) => {
  const [selectedPeriod, setSelectedPeriod] = React.useState('month');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <FadeInUp>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Heading level="h1" size="3xl" className="mb-2">
                Bem-vindo ao Oliver
              </Heading>
              <Text size="lg" color="secondary">
                Gerencie sua assistência técnica de forma profissional
              </Text>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPeriod(selectedPeriod === 'month' ? 'week' : 'month')}
                className="glass-card border-0"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {selectedPeriod === 'month' ? 'Este mês' : 'Esta semana'}
              </Button>
              
              <ScaleOnHover>
                <Button onClick={onNewBudget} className="btn-premium">
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Orçamento
                </Button>
              </ScaleOnHover>
            </div>
          </div>
        </FadeInUp>

        {/* Métricas Principais */}
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Orçamentos"
            value={mockData.metrics.totalBudgets}
            subtitle="Total este mês"
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
            color="blue"
          />
          
          <MetricCard
            title="Clientes"
            value={mockData.metrics.totalClients}
            subtitle="Cadastrados"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
            color="green"
          />
          
          <MetricCard
            title="Faturamento"
            value={`R$ ${mockData.metrics.monthlyRevenue.toLocaleString()}`}
            subtitle="Este mês"
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
            color="yellow"
          />
          
          <MetricCard
            title="Conversão"
            value={`${mockData.metrics.conversionRate}%`}
            subtitle="Taxa de aprovação"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
            color="purple"
          />
        </StaggerList>

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
                onClick={() => onNewBudget?.()}
                color="blue"
                badge="Ctrl+N"
              />
              
              <ActionCard
                title="Ver Orçamentos"
                description="Gerenciar orçamentos existentes"
                icon={Eye}
                onClick={() => onViewBudgets?.()}
                color="green"
              />
              
              <ActionCard
                title="Clientes"
                description="Gerenciar base de clientes"
                icon={Users}
                onClick={() => onViewClients?.()}
                color="purple"
              />
              
              <ActionCard
                title="Relatórios"
                description="Análises e métricas"
                icon={BarChart3}
                onClick={() => onViewReports?.()}
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
                items={mockData.recentBudgets}
                onItemClick={(id) => console.log('Ver orçamento:', id)}
                emptyMessage="Nenhum orçamento encontrado"
              />
            </FadeInUp>
          </div>

          {/* Sidebar com Progresso e Estatísticas */}
          <div className="space-y-6">
            <FadeInUp delay={0.4}>
              <ProgressCard
                title="Meta Semanal"
                current={mockData.weeklyProgress.current}
                total={mockData.weeklyProgress.total}
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
                        <Text size="sm">Backup automático</Text>
                      </div>
                      <Text size="sm" color="secondary">Ativo</Text>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Text size="sm">Sincronização</Text>
                      </div>
                      <Text size="sm" color="secondary">Online</Text>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <Text size="sm">Atualizações</Text>
                      </div>
                      <Text size="sm" color="secondary">Disponível</Text>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeInUp>

            <FadeInUp delay={0.6}>
              <GlassCard variant="gradient">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <Heading level="h4" size="md" weight="semibold" className="mb-2">
                      Dica do Dia
                    </Heading>
                    <Text size="sm" color="secondary">
                      Use atalhos de teclado para agilizar seu trabalho. 
                      Pressione Ctrl+N para criar um novo orçamento rapidamente.
                    </Text>
                  </div>
                </div>
              </GlassCard>
            </FadeInUp>
          </div>
        </div>

        {/* Gráfico de Performance (Placeholder) */}
        <FadeInUp delay={0.7}>
          <GlassCard variant="premium" className="p-8">
            <div className="flex items-center justify-between mb-6">
              <Heading level="h3" size="xl" weight="semibold">
                Performance Mensal
              </Heading>
              <Button variant="outline" size="sm" className="glass-card border-0">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
            
            {/* Placeholder para gráfico */}
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                <Text color="secondary">
                  Gráfico de performance será implementado aqui
                </Text>
              </div>
            </div>
          </GlassCard>
        </FadeInUp>
      </div>
    </div>
  );
};