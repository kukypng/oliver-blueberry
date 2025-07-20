
import React from 'react';
import { DashboardCore } from './DashboardCore';
import { UnifiedDashboardContent } from './UnifiedDashboardContent';
import { useAuth } from '@/hooks/useAuth';

interface ModernDashboardProps {
  onNavigateTo?: (view: string, budgetId?: string) => void;
  activeView?: string;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = (props) => {
  const { profile } = useAuth();

  const handleRefresh = async () => {
    // Refresh logic will be handled by UnifiedDashboardContent
    return Promise.resolve();
  };

  return (
    <DashboardCore
      enablePullToRefresh={true}
      onRefresh={handleRefresh}
      className="modern-dashboard"
    >
      <UnifiedDashboardContent 
        {...props}
        profile={profile}
        isLiteVersion={false}
      />
    </DashboardCore>
  );
};
