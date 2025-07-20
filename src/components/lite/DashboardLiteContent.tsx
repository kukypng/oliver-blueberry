import React from 'react';
import { DashboardCore } from '@/components/dashboard/DashboardCore';
import { UnifiedDashboardContent } from '@/components/dashboard/UnifiedDashboardContent';
import { BudgetLiteListiOS } from './BudgetLiteListiOS';
import { BudgetViewLite } from './BudgetViewLite';
import { NewBudgetLite } from './NewBudgetLite';
import { DataManagementLite } from './DataManagementLite';
import { SettingsLite } from './SettingsLite';
import { AdminLite } from './AdminLite';
import { ClientsLite } from './ClientsLite';

interface DashboardLiteContentProps {
  budgets: any[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  profile?: any;
  activeView?: string;
  selectedBudgetId?: string;
  userId?: string;
  hasPermission?: (permission: string) => boolean;
  onNavigateBack?: () => void;
  onNavigateTo?: (view: string, budgetId?: string) => void;
  isiOSDevice?: boolean;
}

export const DashboardLiteContent = ({ 
  budgets, 
  loading, 
  error, 
  onRefresh,
  profile,
  activeView = 'list',
  selectedBudgetId,
  userId,
  hasPermission,
  onNavigateBack,
  onNavigateTo,
  isiOSDevice = false
}: DashboardLiteContentProps) => {
  
  const handleRefresh = async () => {
    onRefresh();
    return Promise.resolve();
  };

  // Renderizar diferentes views baseado no activeView
  switch (activeView) {
    case 'dashboard':
    case 'list':
    default:
      // Use the unified dashboard for main view
      return (
        <DashboardCore
          enablePullToRefresh={true}
          onRefresh={handleRefresh}
          className="dashboard-lite"
        >
          <UnifiedDashboardContent 
            onNavigateTo={onNavigateTo}
            activeView={activeView}
            profile={profile}
            isLiteVersion={true}
          />
        </DashboardCore>
      );
      
    case 'budget-detail':
      if (!selectedBudgetId) return null;
      return (
        <DashboardCore>
          <BudgetViewLite
            budgetId={selectedBudgetId}
            onBack={onNavigateBack || (() => {})}
            onEdit={(budget) => {
              console.log('Edit budget:', budget);
            }}
            onCopy={(budget) => {
              console.log('Copy budget:', budget);
            }}
          />
        </DashboardCore>
      );
      
    case 'new-budget':
      return (
        <DashboardCore>
          <NewBudgetLite
            userId={userId || ''}
            onBack={onNavigateBack || (() => {})}
          />
        </DashboardCore>
      );
      
    case 'clients':
      return (
        <DashboardCore>
          <ClientsLite
            userId={userId || ''}
            onBack={onNavigateBack || (() => {})}
          />
        </DashboardCore>
      );
      
    case 'data-management':
      return (
        <DashboardCore>
          <DataManagementLite
            userId={userId || ''}
            onBack={onNavigateBack || (() => {})}
          />
        </DashboardCore>
      );
      
    case 'settings':
      return (
        <DashboardCore>
          <SettingsLite
            userId={userId || ''}
            profile={profile}
            onBack={onNavigateBack || (() => {})}
          />
        </DashboardCore>
      );
      
    case 'admin':
      if (!hasPermission?.('manage_users')) return null;
      return (
        <DashboardCore>
          <AdminLite
            userId={userId || ''}
            onBack={onNavigateBack || (() => {})}
          />
        </DashboardCore>
      );
      
    case 'budgets':
      // Legacy budget list view - keep using iOS optimized version
      return (
        <DashboardCore
          enablePullToRefresh={true}
          onRefresh={handleRefresh}
        >
          <BudgetLiteListiOS
            userId={userId || ''}
            profile={profile}
          />
        </DashboardCore>
      );
  }
};
