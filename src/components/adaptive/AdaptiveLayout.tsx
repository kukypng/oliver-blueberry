
import React, { ReactNode } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TabletHeaderNav } from './TabletHeaderNav';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { MobileLoading } from '@/components/ui/mobile-loading';
import { MobileMenuProvider } from '@/components/mobile/MobileMenuProvider';
import { MobileHamburgerButton } from '@/components/mobile/MobileHamburgerButton';
import { MobileHamburgerMenu } from '@/components/mobile/MobileHamburgerMenu';
import { useMobileMenuContext } from '@/components/mobile/MobileMenuProvider';
import { useAppInfo } from '@/hooks/useAppConfig';

interface AdaptiveLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Mobile Layout Component with Menu Integration
const MobileLayoutContent = ({ children, activeTab, onTabChange }: AdaptiveLayoutProps) => {
  const { safeArea } = useLayout();
  const appInfo = useAppInfo();
  const { 
    isOpen, 
    menuData, 
    toggleMenu, 
    closeMenu, 
    handleLogout 
  } = useMobileMenuContext();

  return (
    <div 
      className="min-h-[100dvh] flex flex-col bg-background w-full overflow-hidden relative"
      style={{
        paddingTop: `${safeArea.top}px`,
        paddingLeft: `${safeArea.left}px`,
        paddingRight: `${safeArea.right}px`,
      }}
    >
      {/* Mobile Header with Hamburger Button */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <MobileHamburgerButton
            isOpen={isOpen}
            onClick={toggleMenu}
          />
          <img src={appInfo.logoPath} alt={`${appInfo.name} Logo`} className="h-8 w-8" />
          <h1 className="text-xl font-bold text-foreground">{appInfo.name}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full min-h-full">
          {children}
        </div>
      </main>
      
      <MobileHamburgerMenu 
        isOpen={isOpen}
        onClose={closeMenu}
        onTabChange={onTabChange}
        menuData={menuData}
        onLogout={handleLogout}
      />
    </div>
  );
};

export const AdaptiveLayout = ({ children, activeTab, onTabChange }: AdaptiveLayoutProps) => {
  const layoutContext = useLayout();
  const authContext = useAuth();
  const appInfo = useAppInfo();
  
  // Proteção contra contextos não inicializados
  if (!layoutContext || !authContext) {
    return <MobileLoading message="Inicializando aplicação..." />;
  }

  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    navHeight, 
    containerMaxWidth,
    safeArea,
    orientation
  } = layoutContext;
  const { hasPermission } = authContext;

  if (isDesktop) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className={cn("min-h-screen flex w-full bg-background", containerMaxWidth, "mx-auto")}>
          <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
          
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <header className={cn(
              "flex shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-30",
              navHeight
            )}>
              <div className="flex items-center gap-3">
                <img src={appInfo.logoPath} alt={`${appInfo.name} Logo`} className="h-9 w-9" />
                <h1 className="text-2xl font-bold text-foreground">{appInfo.name}</h1>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto">
              <div className="w-full h-full">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (isTablet) {
    return (
      <div className="min-h-screen flex flex-col bg-background w-full">
        <TabletHeaderNav 
          activeTab={activeTab} 
          onTabChange={onTabChange}
        />
        
        <main className={cn(
          "flex-1 overflow-y-auto w-full",
          orientation === 'landscape' ? "pb-2" : "pb-4"
        )}>
          <div className={cn("w-full h-full", containerMaxWidth, "mx-auto")}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile layout - Integração com novo sistema de menu
  return (
    <MobileMenuProvider>
      <MobileLayoutContent 
        activeTab={activeTab} 
        onTabChange={onTabChange}
      >
        {children}
      </MobileLayoutContent>
    </MobileMenuProvider>
  );
};
