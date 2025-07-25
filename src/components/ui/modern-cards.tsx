/**
 * Modern Cards Component - Apple/iOS Design System
 * Cards premium com glass morphism, depth e interatividade
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useIOSHaptic } from './animations-ios';

const cardVariants = cva(
  "rounded-2xl border transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Default card with subtle elevation
        default: "bg-card text-card-foreground border-border/50 shadow-soft hover:shadow-medium",
        
        // Glass morphism card
        glass: "bg-background/20 backdrop-blur-xl border-white/10 text-foreground shadow-soft hover:shadow-medium hover:bg-background/30",
        
        // Elevated card with strong shadow
        elevated: "bg-card text-card-foreground border-border/30 shadow-medium hover:shadow-strong",
        
        // Premium card with gradient border
        premium: "bg-card text-card-foreground border-primary/20 shadow-medium hover:shadow-premium hover:border-primary/40",
        
        // Interactive card for clickable content
        interactive: "bg-card text-card-foreground border-border/50 shadow-soft hover:shadow-strong hover:border-primary/30 cursor-pointer",
        
        // Outline card
        outline: "bg-transparent border-border text-foreground hover:bg-accent/5",
        
        // Filled card
        filled: "bg-muted/50 border-transparent text-foreground hover:bg-muted/70"
      },
      size: {
        sm: "p-4 rounded-xl",
        default: "p-6 rounded-2xl", 
        lg: "p-8 rounded-3xl",
        xl: "p-10 rounded-3xl"
      },
      animation: {
        none: "",
        hover: "hover:-translate-y-1",
        scale: "hover:scale-[1.01]",
        lift: "hover:-translate-y-2 hover:scale-[1.01]",
        glow: "hover:shadow-[0_0_30px_rgba(254,200,50,0.15)]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "hover"
    }
  }
);

export interface ModernCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    haptic = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const { triggerHaptic } = useIOSHaptic();

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (haptic) {
        triggerHaptic('light');
      }
      onClick?.(event);
    };

    const cardContent = (
      <div
        className={cn(cardVariants({ variant, size, animation, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );

    // Wrap with motion for enhanced animations
    if (animation !== 'none') {
      return (
        <motion.div
          whileHover={{ 
            y: animation === 'hover' || animation === 'lift' ? -4 : 0,
            scale: animation === 'scale' || animation === 'lift' ? 1.01 : 1
          }}
          whileTap={{ 
            scale: variant === 'interactive' ? 0.99 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17
          }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);

ModernCard.displayName = "ModernCard";

// Card Header Component
const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
ModernCardHeader.displayName = "ModernCardHeader";

// Card Title Component
const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ModernCardTitle.displayName = "ModernCardTitle";

// Card Description Component
const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
ModernCardDescription.displayName = "ModernCardDescription";

// Card Content Component
const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
ModernCardContent.displayName = "ModernCardContent";

// Card Footer Component
const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
ModernCardFooter.displayName = "ModernCardFooter";

// Swipeable Card Component (iOS-style)
interface SwipeableCardProps extends ModernCardProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

const SwipeableCard = React.forwardRef<HTMLDivElement, SwipeableCardProps>(
  ({ 
    onSwipeLeft,
    onSwipeRight,
    swipeThreshold = 100,
    children,
    ...props 
  }, ref) => {
    const [dragX, setDragX] = React.useState(0);
    const { triggerHaptic } = useIOSHaptic();

    const handleDragEnd = (event: any, info: any) => {
      const { offset } = info;
      
      if (Math.abs(offset.x) > swipeThreshold) {
        triggerHaptic('medium');
        
        if (offset.x > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (offset.x < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      
      setDragX(0);
    };

    return (
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        whileDrag={{ scale: 0.98 }}
      >
        <ModernCard ref={ref} {...props}>
          {children}
        </ModernCard>
      </motion.div>
    );
  }
);

SwipeableCard.displayName = "SwipeableCard";

// Stats Card Component
interface StatsCardProps extends ModernCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, change, icon, ...props }, ref) => {
    const trendColors = {
      up: 'text-success',
      down: 'text-destructive', 
      neutral: 'text-muted-foreground'
    };

    return (
      <ModernCard ref={ref} variant="glass" animation="lift" {...props}>
        <ModernCardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change && (
                <p className={cn("text-xs font-medium", trendColors[change.trend])}>
                  {change.value}
                </p>
              )}
            </div>
            {icon && (
              <div className="text-primary opacity-80">
                {icon}
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }
);

StatsCard.displayName = "StatsCard";

export {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
  ModernCardFooter,
  SwipeableCard,
  StatsCard,
  cardVariants
};