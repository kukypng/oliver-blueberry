
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface UnifiedDashboardCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  loading?: boolean;
}

export const UnifiedDashboardCard: React.FC<UnifiedDashboardCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  onClick,
  isInteractive = false,
  icon,
  badge,
  loading = false
}) => {
  const { isMobile, isIOS } = useDeviceDetection();

  const cardAnimations = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    },
    hover: isInteractive ? {
      y: -4,
      scale: 1.02
    } : {},
    tap: isInteractive ? {
      scale: 0.98
    } : {}
  };

  if (loading) {
    return (
      <Card className={cn(
        'glass-card animate-pulse',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-3 bg-muted rounded w-1/2 mt-1"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={cardAnimations}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className="will-change-transform"
    >
      <Card
        className={cn(
          // Base card styles
          'glass-card shadow-soft border border-border/30',
          // iOS specific styling
          isIOS && 'rounded-2xl backdrop-blur-xl',
          // Interactive states
          isInteractive && [
            'cursor-pointer transition-all duration-200',
            'hover:shadow-medium hover:border-border/50',
            'active:shadow-soft'
          ],
          // Touch optimization
          isMobile && 'min-h-[var(--touch-target-comfortable)]',
          className
        )}
        onClick={onClick}
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* Header with title, subtitle, icon, and badge */}
        {(title || subtitle || icon || badge) && (
          <CardHeader className={cn(
            'pb-3',
            isMobile ? 'px-4 pt-4' : 'px-6 pt-6'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    {icon}
                  </motion.div>
                )}
                <div className="min-w-0 flex-1">
                  {title && (
                    <CardTitle className={cn(
                      'font-semibold text-foreground',
                      isMobile ? 'text-base' : 'text-lg'
                    )}>
                      {title}
                    </CardTitle>
                  )}
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1 leading-snug">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  {badge}
                </motion.div>
              )}
            </div>
          </CardHeader>
        )}

        {/* Content */}
        <CardContent className={cn(
          isMobile ? 'px-4 pb-4' : 'px-6 pb-6',
          (title || subtitle) && 'pt-0'
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
