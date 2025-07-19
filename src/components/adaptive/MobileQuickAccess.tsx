
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, List, Settings, Shield, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';

interface MobileQuickAccessProps {
  onTabChange: (tab: string) => void;
  hasPermission: (permission: string) => boolean;
}

export const MobileQuickAccess = ({
  onTabChange,
  hasPermission
}: MobileQuickAccessProps) => {
  const { density } = useLayout();
  
  const quickActions = [
    {
      id: 'new-budget',
      icon: PlusCircle,
      label: 'Novo\nOrçamento',
      color: 'text-green-500',
      permission: 'create_budgets'
    },
    {
      id: 'budgets',
      icon: List,
      label: 'Ver\nOrçamentos',
      color: 'text-blue-500',
      permission: 'view_own_budgets'
    },
    {
      id: 'data-management',
      icon: Database,
      label: 'Dados',
      color: 'text-purple-500',
      permission: null
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Configurações',
      color: 'text-slate-500',
      permission: null
    },
    {
      id: 'admin',
      icon: Shield,
      label: 'Painel\nAdmin',
      color: 'text-red-500',
      permission: 'manage_users'
    }
  ];

  const visibleActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  const isCompact = density === 'compact';

  return (
    <Card className="glass-card shadow-strong w-full">
      <CardContent className={cn("w-full", isCompact ? "p-4" : "p-6")}>
        <h3 className={cn("font-semibold mb-3", isCompact ? "text-base" : "text-lg")}>Ações Rápidas</h3>
        
        <div className="grid grid-cols-2 gap-3 w-full">
          {visibleActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => onTabChange(action.id)}
                className={cn(
                  "flex-col gap-2 bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 group transition-all duration-200 hover:scale-105 w-full",
                  isCompact ? "h-20" : "h-24"
                )}
              >
                <div className="p-2 rounded-lg bg-background/10 group-hover:bg-white/20">
                  <Icon className={cn(action.color, "group-hover:text-white", isCompact ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <span className={cn("font-medium text-center leading-tight whitespace-pre-line", isCompact ? "text-[10px]" : "text-xs")}>
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
