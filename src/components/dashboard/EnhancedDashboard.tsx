import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserLicenseCard } from '@/components/dashboard/UserLicenseCard';
import { UserLicenseCardIOS } from '@/components/dashboard/UserLicenseCardIOS';
import { useIOSDetection } from '@/hooks/useIOSDetection';
import { LicenseStatus } from '@/components/dashboard/LicenseStatus';
import { Sparkles, ShoppingBag, CreditCard, MessageCircle, HeartCrack, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLicenseNotifications } from '@/hooks/useLicenseNotifications';

interface ModernDashboardProps {
  onNavigateTo?: (view: string, budgetId?: string) => void;
  activeView?: string;
}

export const EnhancedDashboard = ({ onNavigateTo, activeView }: ModernDashboardProps) => {
  const { profile } = useAuth();
  const isIOS = useIOSDetection();
  useLicenseNotifications();

  const [budgets, setBudgets] = useState<any[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!profile?.id) return;

      setBudgetsLoading(true);
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('id, client_name, created_at, total_price')
          .eq('owner_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching recent budgets:', error);
          setBudgets([]);
        } else {
          setBudgets(data || []);
        }
      } catch (error) {
        console.error('Error fetching recent budgets:', error);
        setBudgets([]);
      } finally {
        setBudgetsLoading(false);
      }
    };

    fetchBudgets();
  }, [profile?.id]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {profile?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel de controle
          </p>
        </div>
      </div>

      {/* License Status Card - New Addition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isIOS ? <UserLicenseCardIOS /> : <UserLicenseCard />}
        
        <Card className="glass-card shadow-strong animate-slide-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Estatísticas</CardTitle>
            <CardTitle className="text-sm text-muted-foreground">Visão geral</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <ShoppingBag className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">R$ 2.457,00</div>
                <div className="text-sm text-muted-foreground">Total Gasto</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-blue-100 p-3">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">R$ 1.234,00</div>
                <div className="text-sm text-muted-foreground">Orçamento Restante</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-strong animate-slide-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Recursos</CardTitle>
            <CardTitle className="text-sm text-muted-foreground">Links úteis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="secondary" className="w-full justify-start gap-2">
              <Sparkles className="h-4 w-4" />
              Novos Recursos
            </Button>
            <Button variant="secondary" className="w-full justify-start gap-2">
              <Shield className="h-4 w-4" />
              Central de Ajuda
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card shadow-strong animate-slide-up">
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
          <CardTitle className="text-sm text-muted-foreground">
            Seus últimos orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetsLoading ? (
            <p>Carregando orçamentos...</p>
          ) : budgets && budgets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <Card key={budget.id} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>{budget.client_name}</CardTitle>
                    <CardTitle className="text-sm text-muted-foreground">
                      Criado em {new Date(budget.created_at).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">R$ {budget.total_price}</p>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => onNavigateTo?.('budget-details', budget.id)}
                    >
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>Nenhum orçamento recente encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
