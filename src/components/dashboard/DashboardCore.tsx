
import React from 'react';
import { motion } from 'framer-motion';
import { iosDesignTokens } from '@/lib/design-tokens-ios';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface DashboardCoreProps {
  children: React.ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const iosAnimations = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // iOS smooth curve
        staggerChildren: 0.1
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
};

export const DashboardCore: React.FC<DashboardCoreProps> = ({
  children,
  className = '',
  enablePullToRefresh = true,
  onRefresh,
  isRefreshing = false
}) => {
  const { isMobile, isIOS } = useDeviceDetection();
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isPulling, setIsPulling] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Pull to refresh handler
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!enablePullToRefresh || !containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    if (scrollTop <= 0) {
      setIsPulling(true);
      setPullDistance(0);
    }
  }, [enablePullToRefresh]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isPulling || !containerRef.current) return;
    
    const touch = e.touches[0];
    const startY = containerRef.current.getBoundingClientRect().top;
    const currentY = touch.clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, 80)); // Limit pull distance
    }
  }, [isPulling]);

  const handleTouchEnd = React.useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance > 60 && onRefresh && !isRefreshing) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh, isRefreshing]);

  // Haptic feedback simulation
  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: [10], medium: [20], heavy: [30] };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  React.useEffect(() => {
    if (pullDistance > 60 && isPulling) {
      triggerHaptic('light');
    }
  }, [pullDistance, isPulling, triggerHaptic]);

  const coreStyles = React.useMemo(() => ({
    minHeight: isMobile ? '100dvh' : '100vh',
    fontFamily: iosDesignTokens.typography.fontFamily.system,
    transform: isPulling ? `translateY(${pullDistance}px)` : 'translateY(0px)',
    transition: isPulling ? 'none' : 'transform 0.3s var(--spring-smooth)',
  }), [isMobile, isPulling, pullDistance]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        // Base styles
        'dashboard-core relative overflow-auto bg-background text-foreground',
        // iOS specific optimizations
        'ios-scroll',
        // Safe area handling
        isIOS && 'safe-all',
        // Mobile specific styles
        isMobile && 'pb-safe-bottom',
        className
      )}
      style={coreStyles}
      variants={iosAnimations.container}
      initial="initial"
      animate="animate"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && isPulling && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50"
          style={{ 
            y: pullDistance > 60 ? -20 : -40,
            opacity: pullDistance / 60 
          }}
          animate={{
            rotate: pullDistance > 60 ? 180 : 0,
            scale: pullDistance > 60 ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'bg-primary text-primary-foreground shadow-md',
            pullDistance > 60 && 'bg-green-500'
          )}>
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ 
                duration: 1, 
                repeat: isRefreshing ? Infinity : 0,
                ease: 'linear'
              }}
            >
              ↻
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main content with staggered animations */}
      <motion.div
        className="dashboard-content"
        variants={iosAnimations.item}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
