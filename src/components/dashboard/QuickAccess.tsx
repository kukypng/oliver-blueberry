
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Settings, Shield, Database, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAccessProps {
  onTabChange: (tab: string) => void;
  hasPermission: (permission: string) => boolean;
}

interface QuickAccessButton {
  label: string;
  icon: LucideIcon;
  tab: string;
  permission: string | null;
  iconColorClass: string;
}

const quickAccessButtons: QuickAccessButton[] = [
  { label: 'Novo Orçamento', icon: PlusCircle, tab: 'new-budget', permission: 'create_budgets', iconColorClass: 'text-green-500' },
  { label: 'Ver Orçamentos', icon: List, tab: 'budgets', permission: 'view_own_budgets', iconColorClass: 'text-blue-500' },
  { label: 'Gestão de Dados', icon: Database, tab: 'data-management', permission: null, iconColorClass: 'text-purple-500' },
  { label: 'Configurações', icon: Settings, tab: 'settings', permission: null, iconColorClass: 'text-slate-500' },
  { label: 'Painel Admin', icon: Shield, tab: 'admin', permission: 'manage_users', iconColorClass: 'text-red-500' },
];

export const QuickAccess = ({ onTabChange, hasPermission }: QuickAccessProps) => {
  const navigate = useNavigate();

  const handleButtonClick = (btn: QuickAccessButton) => {
    // Redirecionar para a página dedicada de orçamentos para compatibilidade com iPhone
    if (btn.tab === 'budgets') {
      navigate('/budgets');
    } else {
      onTabChange(btn.tab);
    }
  };

  return (
    <Card className="glass-card shadow-strong animate-slide-up">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-xl lg:text-2xl font-bold text-foreground">
          Acesso Rápido
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 pt-0">
        {quickAccessButtons.map(btn => {
          if (btn.permission && !hasPermission(btn.permission)) {
            return null;
          }
          const Icon = btn.icon;
          return (
            <Button
              key={btn.tab}
              variant="outline"
              onClick={() => handleButtonClick(btn)}
              className="group flex-col h-32 text-center text-sm font-medium bg-background/50 hover:bg-primary border-border/50 hover-lift text-foreground"
            >
              <Icon className={`h-8 w-8 mb-3 transition-transform group-hover:scale-110 ${btn.iconColorClass} group-hover:text-white`} />
              <span className="font-semibold group-hover:text-white">{btn.label}</span>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  );
};
