import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { AdaptiveLayout } from '@/components/adaptive/AdaptiveLayout';
import { DashboardLiteContent } from '@/components/lite/DashboardLiteContent';
import { DashboardLiteStats } from '@/components/lite/DashboardLiteStats';
import { DashboardLiteQuickAccess } from '@/components/lite/DashboardLiteQuickAccess';
import { DashboardLiteLicenseStatus } from '@/components/lite/DashboardLiteLicenseStatus';
import { DashboardLiteHelpSupport } from '@/components/lite/DashboardLiteHelpSupport';
import { BudgetErrorBoundary, AuthErrorBoundary } from '@/components/ErrorBoundaries';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { useBudgetData } from '@/hooks/useBudgetData';
export const DashboardLite = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { profile, user, hasPermission } = useAuth();
  
  // Memoização da verificação de iOS para evitar recálculos
  const isiOSDevice = useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  }, []);

  // Aguardar user e profile estarem disponíveis
  const isReady = useMemo(() => Boolean(user?.id && profile), [user?.id, profile]);

  // Hook para gerenciar dados dos orçamentos
  const { budgets, loading, error, refreshing, handleRefresh } = useBudgetData(user?.id || '');

  // Real-time subscription otimizada
  useEffect(() => {
    if (!isReady || !user?.id) return;

    // Subscription para atualizações em tempo real
    let subscription: any = null;
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const setupSubscription = () => {
      subscription = supabase.channel('budget_changes_lite').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budgets',
        filter: `owner_id=eq.${user.id}`
      }, payload => {
        console.log('Budget change detected:', payload);
        
        // Clear previous timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // Debounce para evitar múltiplas chamadas
        debounceTimer = setTimeout(() => {
          handleRefresh();
          debounceTimer = null;
        }, 500);
      }).subscribe();
    };
    setupSubscription();
    
    return () => {
      // Clear debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Remove subscription properly
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isReady, user?.id, handleRefresh]);

  // Otimização para iOS: não renderizar nada até dados estarem prontos
  if (!isReady) {
    return <div className="h-[100dvh] bg-background flex items-center justify-center" style={{
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none'
    }}>
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }

  // Memoização do conteúdo principal para evitar re-renders desnecessários
  const dashboardContent = useMemo(() => <div className="p-4 space-y-4">
      <DashboardLiteStats profile={profile} userId={user?.id} />
      <DashboardLiteQuickAccess onTabChange={setActiveTab} hasPermission={hasPermission} />
      <DashboardLiteLicenseStatus profile={profile} />
      <DashboardLiteHelpSupport />
      
      {/* Preview recente de orçamentos otimizado */}
      
    </div>, [profile, user?.id, hasPermission, loading, refreshing, budgets]);
  const renderContent = useCallback(() => {
    if (activeTab !== 'dashboard') {
      return <DashboardLiteContent budgets={budgets} loading={loading} error={error} onRefresh={handleRefresh} profile={profile} activeView={activeTab} userId={user.id} hasPermission={hasPermission} onNavigateBack={() => setActiveTab('dashboard')} onNavigateTo={(view, budgetId) => {
        if (budgetId) {
          console.log('Navigate to budget detail:', budgetId);
        } else {
          setActiveTab(view);
        }
      }} isiOSDevice={isiOSDevice} />;
    }
    return dashboardContent;
  }, [activeTab, budgets, loading, error, handleRefresh, profile, user.id, hasPermission, isiOSDevice, dashboardContent]);
  return (
    <AuthErrorBoundary>
      <AuthGuard>
        <BudgetErrorBoundary>
          <LayoutProvider>
            <AdaptiveLayout 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              {renderContent()}
            </AdaptiveLayout>
          </LayoutProvider>
        </BudgetErrorBoundary>
      </AuthGuard>
    </AuthErrorBoundary>
  );
};