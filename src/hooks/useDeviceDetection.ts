import { useEffect, useState } from 'react';

export interface DeviceDetection {
  // Basic device info
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // OS detection
  isIOS: boolean;
  isAndroid: boolean;
  isIPhone: boolean;
  
  // Browser detection
  isSafari: boolean;
  isIOSSafari: boolean;
  
  // Touch and interaction
  isTouchDevice: boolean;
  
  // Viewport info
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  
  // iOS specific
  isStandalone: boolean;
  viewportHeight: string;
  version: number | null;
  
  // Safe area (iOS)
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Layout helpers
  shouldUseLite: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  isUltraWide: boolean;
}

const detectDevice = (): DeviceDetection => {
  if (typeof window === 'undefined' || !navigator) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isIPhone: false,
      isSafari: false,
      isIOSSafari: false,
      isTouchDevice: false,
      width: 1920,
      height: 1080,
      orientation: 'landscape',
      isStandalone: false,
      viewportHeight: '100vh',
      version: null,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      shouldUseLite: false,
      density: 'comfortable',
      isUltraWide: false,
    };
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const platform = navigator.platform;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // OS Detection
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIPhone = /iPhone/.test(userAgent) && !isAndroid;
  
  // Browser Detection
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
  const isIOSSafari = isIOS && isSafari;
  
  // Device Type Detection
  const isMobile = width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  const isTablet = width >= 768 && width < 1200 && (isMobile || navigator.maxTouchPoints > 1);
  const isDesktop = width >= 1200 && !isMobile;
  
  // Touch Detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // iOS Version
  let version: number | null = null;
  if (isIOS) {
    const versionMatch = userAgent.match(/OS (\d+)[._](\d+)?/) || 
      userAgent.match(/Version\/(\d+)\.(\d+)/);
    if (versionMatch) {
      version = parseInt(versionMatch[1], 10);
    }
  }
  
  // iOS Standalone Detection
  const isStandalone = (window.navigator as any).standalone || 
    window.matchMedia('(display-mode: standalone)').matches;
  
  // Safe Area Insets
  const getSafeAreaInsets = () => {
    try {
      const computedStyle = getComputedStyle(document.documentElement);
      return {
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || 
             computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || 
                computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || 
               computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || 
                computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0')
      };
    } catch {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
  };
  
  // Layout Helpers
  const getDensity = () => {
    if (isMobile) return 'compact';
    if (isTablet) return 'comfortable';
    return width > 1600 ? 'spacious' : 'comfortable';
  };
  
  // Check admin preferences
  const manualLiteEnabled = localStorage.getItem('painel-enabled') === 'true';
  const forceNormalDashboard = localStorage.getItem('force-normal-dashboard') === 'true';
  
  let shouldUseLite = isMobile || isTablet;
  
  if (forceNormalDashboard) {
    shouldUseLite = false;
  } else if (manualLiteEnabled) {
    shouldUseLite = true;
  }
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS: forceNormalDashboard ? false : (manualLiteEnabled ? true : isIOS),
    isAndroid: forceNormalDashboard ? false : (manualLiteEnabled ? false : isAndroid),
    isIPhone: forceNormalDashboard ? false : (manualLiteEnabled ? true : isIPhone),
    isSafari: manualLiteEnabled ? true : isSafari,
    isIOSSafari: manualLiteEnabled ? true : isIOSSafari,
    isTouchDevice,
    width,
    height,
    orientation: width > height ? 'landscape' : 'portrait',
    isStandalone,
    viewportHeight: isIOS ? '100dvh' : '100vh',
    version: manualLiteEnabled ? 16 : version,
    safeAreaInsets: getSafeAreaInsets(),
    shouldUseLite,
    density: getDensity(),
    isUltraWide: width / height > 2.1,
  };
};

export const useDeviceDetection = (): DeviceDetection => {
  const [detection, setDetection] = useState<DeviceDetection>(() => detectDevice());

  useEffect(() => {
    const updateDetection = () => {
      setDetection(detectDevice());
    };

    // Listen for various events that might change device detection
    const handleResize = () => {
      setTimeout(updateDetection, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(updateDetection, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen for storage changes for admin preferences
    window.addEventListener('storage', updateDetection);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('storage', updateDetection);
    };
  }, []);

  return detection;
};