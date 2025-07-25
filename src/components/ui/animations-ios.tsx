/**
 * iOS-specific animation utilities and components - Enhanced Apple Design
 */

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

// iOS-specific animation configurations
export const iOSSpringConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1
};

export const iOSEasing = [0.25, 0.46, 0.45, 0.94] as const;

// Enhanced iOS bounce animation variants
export const iosAnimations = {
  slideIn: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'spring' as const, damping: 20, stiffness: 300 }
  },
  
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 }
  },
  
  bounceIn: {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.3, opacity: 0 },
    transition: { type: 'spring' as const, damping: 15, stiffness: 400 }
  },
  
  fadeSlide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },

  // New Apple-style animations
  modalPresent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
  },

  sheetSlide: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 }
  },

  navPush: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
  },

  tabSwitch: {
    inactive: { scale: 0.95, opacity: 0.6, y: 2 },
    active: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
    }
  }
};

// iOS-optimized motion wrapper
interface IOSMotionProps {
  children: React.ReactNode;
  animation?: keyof typeof iosAnimations;
  delay?: number;
  className?: string;
}

export const IOSMotion = ({ 
  children, 
  animation = 'fadeSlide', 
  delay = 0,
  className = ""
}: IOSMotionProps) => {
  const animConfig = iosAnimations[animation];
  
  return (
    <motion.div
      className={className}
      initial={animConfig.initial}
      animate={animConfig.animate}
      exit={animConfig.exit}
      transition={{ ...animConfig.transition, delay } as any}
      style={{
        willChange: 'transform, opacity',
        WebkitBackfaceVisibility: 'hidden',
        WebkitPerspective: 1000,
        WebkitTransform: 'translate3d(0,0,0)'
      }}
    >
      {children}
    </motion.div>
  );
};

// iOS-style loading spinner
interface IOSSpinnerProps {
  size?: number;
  className?: string;
}

export const IOSSpinner: React.FC<IOSSpinnerProps> = ({ 
  size = 20, 
  className = "" 
}) => (
  <motion.div
    className={`inline-block border-2 border-current border-t-transparent rounded-full ${className}`}
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

// iOS-style pull to refresh
interface IOSPullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  isRefreshing?: boolean;
  threshold?: number;
}

export const IOSPullToRefresh: React.FC<IOSPullToRefreshProps> = ({ 
  children, 
  onRefresh, 
  isRefreshing = false,
  threshold = 60 
}) => {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isTriggered, setIsTriggered] = React.useState(false);

  const handlePan = (event: any, info: PanInfo) => {
    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, threshold * 1.5));
      
      if (info.offset.y > threshold && !isTriggered) {
        setIsTriggered(true);
        simulateHaptic('medium');
      }
    }
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    if (isTriggered && info.offset.y > threshold) {
      onRefresh();
    }
    setPullDistance(0);
    setIsTriggered(false);
  };

  return (
    <motion.div
      className="relative overflow-hidden"
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      style={{ y: pullDistance }}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 z-10"
        initial={{ opacity: 0, y: -60 }}
        animate={{ 
          opacity: pullDistance > 20 ? 1 : 0,
          y: pullDistance > 20 ? -40 : -60
        }}
      >
        <IOSSpinner />
      </motion.div>
      
      {children}
    </motion.div>
  );
};

// iOS-style swipe actions
interface IOSSwipeActionsProps {
  children: React.ReactNode;
  leftActions?: Array<{
    label: string;
    color: string;
    action: () => void;
  }>;
  rightActions?: Array<{
    label: string;
    color: string;
    action: () => void;
  }>;
}

export const IOSSwipeActions: React.FC<IOSSwipeActionsProps> = ({
  children,
  leftActions = [],
  rightActions = []
}) => {
  const [swipeOffset, setSwipeOffset] = React.useState(0);

  const handlePan = (event: any, info: PanInfo) => {
    setSwipeOffset(info.offset.x);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const threshold = 80;
    
    if (Math.abs(info.offset.x) > threshold) {
      simulateHaptic('light');
      if (info.offset.x > 0 && leftActions.length > 0) {
        leftActions[0].action();
      } else if (info.offset.x < 0 && rightActions.length > 0) {
        rightActions[0].action();
      }
    }
    
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{ x: swipeOffset > 0 ? 0 : -80 }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              className={`h-full px-4 text-white font-medium ${action.color}`}
              onClick={action.action}
            >
              {action.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center"
          style={{ x: swipeOffset < 0 ? 0 : 80 }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              className={`h-full px-4 text-white font-medium ${action.color}`}
              onClick={action.action}
            >
              {action.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ x: swipeOffset }}
        className="relative z-10 bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Enhanced haptic feedback simulation for web
export const simulateHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  // iOS Safari haptic feedback (if supported)
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 50, 50]
    };
    navigator.vibrate(patterns[type]);
  }
};

// iOS-style haptic feedback hook
export const useIOSHaptic = () => {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    simulateHaptic(type);
  };

  return { triggerHaptic };
};

// iOS safe area utilities
export const iosSafeAreaStyles = {
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)'
};

// iOS-style context menu
interface IOSContextMenuProps {
  children: React.ReactNode;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    destructive?: boolean;
  }>;
}

export const IOSContextMenu: React.FC<IOSContextMenuProps> = ({
  children,
  actions
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    const timer = setTimeout(() => {
      simulateHaptic('medium');
      setPosition({ x: touch.clientX, y: touch.clientY });
      setIsOpen(true);
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed z-50 bg-background rounded-2xl shadow-xl border border-border/50 overflow-hidden min-w-[200px]"
              style={{
                left: Math.min(position.x - 100, window.innerWidth - 220),
                top: Math.min(position.y - 50, window.innerHeight - 200)
              }}
            >
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/30 last:border-b-0 ${
                    action.destructive ? 'text-destructive' : 'text-foreground'
                  }`}
                  onClick={() => {
                    simulateHaptic('light');
                    action.action();
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <span className="font-medium">{action.label}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// iOS scroll optimization
export const iosScrollStyles = {
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'none',
  WebkitTapHighlightColor: 'transparent'
} as React.CSSProperties;

// iOS button press animation
export const iOSButtonPress = {
  scale: 0.95,
  transition: { duration: 0.1, ease: "easeOut" }
};

// iOS-style sheet component
interface IOSSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const IOSSheet: React.FC<IOSSheetProps> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            variants={iosAnimations.sheetSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
            style={iosSafeAreaStyles}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Title */}
            {title && (
              <div className="px-6 pb-4">
                <h2 className="text-lg font-semibold text-center">{title}</h2>
              </div>
            )}
            
            {/* Content */}
            <div className="px-6 pb-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};