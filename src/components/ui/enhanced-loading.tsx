/**
 * Enhanced Loading States - Apple/iOS Design System
 * Loading states elegantes com skeletons animados e spinners
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Apple-style loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  default: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const spinnerColors = {
  primary: 'border-primary',
  secondary: 'border-secondary-foreground',
  muted: 'border-muted-foreground'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  className,
  color = 'primary'
}) => (
  <motion.div
    className={cn(
      'border-2 border-transparent border-t-current rounded-full',
      spinnerSizes[size],
      spinnerColors[color],
      className
    )}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

// Pulsing dots loader
interface PulsingDotsProps {
  className?: string;
  dotCount?: number;
}

export const PulsingDots: React.FC<PulsingDotsProps> = ({
  className,
  dotCount = 3
}) => (
  <div className={cn("flex space-x-1", className)}>
    {Array.from({ length: dotCount }).map((_, i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2
        }}
      />
    ))}
  </div>
);

// Skeleton loader with shimmer effect
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  animation = 'shimmer'
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full aspect-square',
    rounded: 'rounded-2xl'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
    wave: 'animate-pulse'
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-6 space-y-4 bg-card rounded-2xl border border-border/50", className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-8 w-20 rounded-xl" />
      <Skeleton className="h-8 w-16 rounded-xl" />
    </div>
  </div>
);

// List skeleton
export const ListSkeleton: React.FC<{ 
  items?: number;
  className?: string;
}> = ({ items = 5, className }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-card rounded-xl border border-border/50">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn("space-y-2", className)}>
    {/* Header */}
    <div className="flex space-x-4 p-4 bg-muted/30 rounded-xl">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 bg-card rounded-xl border border-border/50">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Progress bar with animation
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showValue = false,
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      {showValue && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

// Loading overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = "Carregando...",
  className
}) => (
  <div className={cn("relative", className)}>
    {children}
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
      >
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground font-medium">{message}</p>
        </div>
      </motion.div>
    )}
  </div>
);

// Floating action button with loading state
interface LoadingFABProps {
  isLoading: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
}

export const LoadingFAB: React.FC<LoadingFABProps> = ({
  isLoading,
  onClick,
  icon,
  className
}) => (
  <motion.button
    className={cn(
      "fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center z-40",
      className
    )}
    onClick={onClick}
    disabled={isLoading}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 17
    }}
  >
    {isLoading ? (
      <LoadingSpinner size="sm" color="secondary" />
    ) : (
      icon
    )}
  </motion.button>
);

// Staggered loading animation for lists
interface StaggeredLoadingProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const StaggeredLoading: React.FC<StaggeredLoadingProps> = ({
  children,
  className,
  staggerDelay = 0.1
}) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
  >
    {children.map((child, index) => (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 17
            }
          }
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);