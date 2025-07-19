
import React, { createContext, useContext, ReactNode } from 'react';
import { useDeviceType, DeviceInfo } from '@/hooks/useDeviceType';

interface LayoutContextType extends DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  showSidebar: boolean;
  showBottomNav: boolean;
  contentPadding: string;
  navigationStyle: 'sidebar' | 'bottom' | 'header';
  gridCols: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  containerMaxWidth: string;
  navHeight: string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const deviceInfo = useDeviceType();
  
  const getSpacing = () => {
    switch (deviceInfo.density) {
      case 'compact':
        return { xs: 'space-y-2', sm: 'space-y-3', md: 'space-y-4', lg: 'space-y-5', xl: 'space-y-6' };
      case 'spacious':
        return { xs: 'space-y-4', sm: 'space-y-6', md: 'space-y-8', lg: 'space-y-10', xl: 'space-y-12' };
      default:
        return { xs: 'space-y-3', sm: 'space-y-4', md: 'space-y-6', lg: 'space-y-8', xl: 'space-y-10' };
    }
  };

  const getContentPadding = () => {
    if (deviceInfo.type === 'mobile') {
      return 'p-3 sm:p-4';
    }
    if (deviceInfo.type === 'tablet') {
      return deviceInfo.orientation === 'portrait' ? 'p-4 md:p-6' : 'p-6 md:p-8';
    }
    return deviceInfo.isUltraWide ? 'p-8 xl:p-12' : 'p-6 lg:p-8';
  };

  const getGridCols = () => {
    if (deviceInfo.type === 'mobile') {
      return 'grid-cols-1';
    }
    if (deviceInfo.type === 'tablet') {
      return deviceInfo.orientation === 'portrait' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3';
    }
    return deviceInfo.isUltraWide ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
  };

  const getNavHeight = () => {
    if (deviceInfo.type === 'mobile') return 'h-14';
    if (deviceInfo.type === 'tablet') return 'h-16';
    return 'h-20';
  };

  const getContainerMaxWidth = () => {
    if (deviceInfo.isUltraWide) return 'max-w-screen-2xl';
    if (deviceInfo.type === 'desktop') return 'max-w-screen-xl';
    return 'max-w-full';
  };

  const layoutConfig: LayoutContextType = {
    ...deviceInfo,
    isMobile: deviceInfo.type === 'mobile',
    isTablet: deviceInfo.type === 'tablet',
    isDesktop: deviceInfo.type === 'desktop',
    showSidebar: deviceInfo.type === 'desktop',
    showBottomNav: deviceInfo.type === 'mobile',
    contentPadding: getContentPadding(),
    navigationStyle: deviceInfo.type === 'mobile' ? 'bottom' : deviceInfo.type === 'tablet' ? 'header' : 'sidebar',
    gridCols: getGridCols(),
    spacing: getSpacing(),
    containerMaxWidth: getContainerMaxWidth(),
    navHeight: getNavHeight()
  };

  return (
    <LayoutContext.Provider value={layoutConfig}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
