/**
 * Enhanced Button Component - Apple/iOS Design System
 * Botões premium com animações, haptic feedback e micro-interactions
 */

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useIOSHaptic } from './animations-ios';
import { RippleEffect } from './animations';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Apple-style primary button
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium hover:shadow-strong active:shadow-soft",
        
        // Apple-style destructive button
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-medium hover:shadow-strong",
        
        // Apple-style outline button
        outline: "border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground shadow-soft hover:shadow-medium hover:border-primary/50",
        
        // Apple-style secondary button
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-medium",
        
        // Apple-style ghost button
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        // Apple-style link button
        link: "text-primary underline-offset-4 hover:underline",
        
        // Premium gradient button
        premium: "bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-premium hover:shadow-xl hover:from-primary/90 hover:to-primary",
        
        // Success button
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-medium hover:shadow-strong",
        
        // Warning button  
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-medium hover:shadow-strong",
        
        // Info button
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-medium hover:shadow-strong",
        
        // Glass morphism button
        glass: "bg-background/20 backdrop-blur-xl border border-white/10 text-foreground hover:bg-background/30 shadow-soft hover:shadow-medium"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-3xl px-10 text-lg",
        icon: "h-12 w-12 rounded-2xl",
        "icon-sm": "h-9 w-9 rounded-xl",
        "icon-lg": "h-14 w-14 rounded-2xl"
      },
      animation: {
        none: "",
        scale: "hover:scale-[1.02] active:scale-[0.97]",
        bounce: "hover:scale-[1.05] active:scale-[0.95]",
        lift: "hover:-translate-y-0.5 active:translate-y-0",
        glow: "hover:shadow-[0_0_20px_rgba(254,200,50,0.3)]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale"
    }
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  haptic?: boolean;
  ripple?: boolean;
  children: React.ReactNode;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    haptic = true,
    ripple = false,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { triggerHaptic } = useIOSHaptic();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      // Haptic feedback
      if (haptic) {
        if (variant === 'destructive') {
          triggerHaptic('error');
        } else if (variant === 'success') {
          triggerHaptic('success');
        } else {
          triggerHaptic('light');
        }
      }
      
      onClick?.(event);
    };

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          </motion.div>
        )}
        {children}
      </>
    );

    const ButtonComponent = (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {ripple ? (
          <RippleEffect>
            {buttonContent}
          </RippleEffect>
        ) : (
          buttonContent
        )}
      </Comp>
    );

    // Wrap with motion for enhanced animations
    if (animation !== 'none') {
      return (
        <motion.div
          whileHover={{ 
            scale: animation === 'bounce' ? 1.05 : animation === 'scale' ? 1.02 : 1,
            y: animation === 'lift' ? -2 : 0
          }}
          whileTap={{ 
            scale: animation === 'bounce' ? 0.95 : animation === 'scale' ? 0.97 : 1,
            y: animation === 'lift' ? 0 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17
          }}
        >
          {ButtonComponent}
        </motion.div>
      );
    }

    return ButtonComponent;
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, buttonVariants };