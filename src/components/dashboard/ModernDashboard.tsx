import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { RecentSales } from '@/components/dashboard/RecentSales';
import { Overview } from '@/components/dashboard/Overview';
import { generateRandomSales } from '@/utils/mock';
import { Sparkles, ShoppingBag, CreditCard, MessageCircle, HeartCrack, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LicenseStatus } from '@/components/dashboard/LicenseStatus';
import { useLicenseNotifications } from '@/hooks/useLicenseNotifications';

export const ModernDashboard = () => {
  useLicenseNotifications();

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Acompanhe as principais métricas do seu negócio</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
          <Link to="/plans">
            <Button size="sm" className="w-full sm:w-auto">
              <CreditCard className="mr-2 h-4 w-4" />
              Ver Planos
            </Button>
          </Link>
        </div>
      </div>

      {/* License Status - Add before existing cards */}
      <LicenseStatus />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Overview title="Receita Total" value="R$ 12.500,00" percentageChange={12} />
        <Overview title="Novos Orçamentos" value="35" percentageChange={22} isPositive={false} />
        <Overview title="Taxa de Conversão" value="84%" percentageChange={8} />
        <Overview title="Clientes Ativos" value="234" percentageChange={15} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 glass-card shadow-strong animate-slide-up">
          <CardHeader>
            <CardTitle>Estatísticas de Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 glass-card shadow-strong animate-slide-up">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardContent>
              <RecentSales salesData={generateRandomSales(5)} />
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
