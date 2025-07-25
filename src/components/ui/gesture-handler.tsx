/**
 * Gesture Handler - Apple/iOS Design System
 * Gestures naturais iOS: swipe, pinch, long press, pull-to-refresh
 */

import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIOSHaptic } from './animations-ios';

// Swipe gesture handler
interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className
}) => {
  const { triggerHaptic } = useIOSHaptic();

  const handlePanEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Check if gesture meets threshold
    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      triggerHaptic('light');
      
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500) {
      triggerHaptic('light');
      
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  return (
    <motion.div
      className={className}
      onPanEnd={handlePanEnd}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
    >
      {children}
    </motion.div>
  );
};

// Long press gesture
interface LongPressGestureProps {
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  className?: string;
}

export const LongPressGesture: React.FC<LongPressGestureProps> = ({
  children,
  onLongPress,
  delay = 500,
  className
}) => {
  const { triggerHaptic } = useIOSHaptic();
  const [isPressed, setIsPressed] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleTouchStart = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      triggerHaptic('medium');
      onLongPress();
      setIsPressed(false);
    }, delay);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <motion.div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      animate={{
        scale: isPressed ? 0.98 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      {children}
    </motion.div>
  );
};

// Pull to refresh gesture
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const { triggerHaptic } = useIOSHaptic();

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, refreshThreshold], [0, 1]);
  const scale = useTransform(y, [0, refreshThreshold], [0.8, 1]);

  const handlePan = (event: any, info: PanInfo) => {
    if (info.offset.y > 0 && !isRefreshing) {
      const distance = Math.min(info.offset.y, refreshThreshold * 1.5);
      setPullDistance(distance);
      y.set(distance);
    }
  };

  const handlePanEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        y.set(0);
      }
    } else {
      setPullDistance(0);
      y.set(0);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 z-10"
        style={{ opacity, scale }}
        initial={{ y: -60 }}
        animate={{ y: pullDistance > 20 ? -40 : -60 }}
      >
        <div className="flex items-center space-x-2 text-primary">
          {isRefreshing ? (
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: pullDistance > refreshThreshold ? 180 : 0 }}
            />
          )}
          <span className="text-sm font-medium">
            {isRefreshing ? 'Atualizando...' : pullDistance > refreshThreshold ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Pinch to zoom gesture
interface PinchToZoomProps {
  children: React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
}

export const PinchToZoom: React.FC<PinchToZoomProps> = ({
  children,
  minZoom = 0.5,
  maxZoom = 3,
  className
}) => {
  const [scale, setScale] = React.useState(1);
  const { triggerHaptic } = useIOSHaptic();

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, minZoom), maxZoom);
    
    if (newScale !== scale) {
      setScale(newScale);
      triggerHaptic('light');
    }
  };

  const handleDoubleClick = () => {
    const newScale = scale === 1 ? 2 : 1;
    setScale(newScale);
    triggerHaptic('medium');
  };

  return (
    <div 
      className={cn("overflow-hidden cursor-grab active:cursor-grabbing", className)}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <motion.div
        animate={{ scale }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        style={{ transformOrigin: "center" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Edge swipe navigation (iOS-style back gesture)
interface EdgeSwipeProps {
  children: React.ReactNode;
  onEdgeSwipeRight?: () => void;
  onEdgeSwipeLeft?: () => void;
  edgeThreshold?: number;
  className?: string;
}

export const EdgeSwipe: React.FC<EdgeSwipeProps> = ({
  children,
  onEdgeSwipeRight,
  onEdgeSwipeLeft,
  edgeThreshold = 20,
  className
}) => {
  const { triggerHaptic } = useIOSHaptic();
  const [startX, setStartX] = React.useState(0);

  const handleTouchStart = (event: React.TouchEvent) => {
    setStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const endX = event.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const windowWidth = window.innerWidth;

    // Left edge swipe (back gesture)
    if (startX < edgeThreshold && deltaX > 50 && onEdgeSwipeRight) {
      triggerHaptic('light');
      onEdgeSwipeRight();
    }
    
    // Right edge swipe
    if (startX > windowWidth - edgeThreshold && deltaX < -50 && onEdgeSwipeLeft) {
      triggerHaptic('light');
      onEdgeSwipeLeft();
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

// Drag to dismiss gesture
interface DragToDismissProps {
  children: React.ReactNode;
  onDismiss: () => void;
  dismissThreshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const DragToDismiss: React.FC<DragToDismissProps> = ({
  children,
  onDismiss,
  dismissThreshold = 100,
  direction = 'down',
  className
}) => {
  const { triggerHaptic } = useIOSHaptic();

  const handlePanEnd = (event: any, info: PanInfo) => {
    const { offset } = info;
    let shouldDismiss = false;

    switch (direction) {
      case 'up':
        shouldDismiss = offset.y < -dismissThreshold;
        break;
      case 'down':
        shouldDismiss = offset.y > dismissThreshold;
        break;
      case 'left':
        shouldDismiss = offset.x < -dismissThreshold;
        break;
      case 'right':
        shouldDismiss = offset.x > dismissThreshold;
        break;
    }

    if (shouldDismiss) {
      triggerHaptic('success');
      onDismiss();
    }
  };

  const dragConstraints = {
    up: { top: -dismissThreshold * 2, bottom: 0, left: 0, right: 0 },
    down: { top: 0, bottom: dismissThreshold * 2, left: 0, right: 0 },
    left: { top: 0, bottom: 0, left: -dismissThreshold * 2, right: 0 },
    right: { top: 0, bottom: 0, left: 0, right: dismissThreshold * 2 }
  };

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={dragConstraints[direction]}
      dragElastic={0.2}
      onPanEnd={handlePanEnd}
      whileDrag={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};