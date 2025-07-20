
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface UnifiedDashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  showNotifications?: boolean;
  className?: string;
}

export const UnifiedDashboardHeader: React.FC<UnifiedDashboardHeaderProps> = ({
  title = "Oliver",
  subtitle,
  onSettingsClick,
  onNotificationsClick,
  showNotifications = true,
  className = ''
}) => {
  const { profile } = useAuth();
  const { isMobile, isIOS } = useDeviceDetection();

  const headerAnimations = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.header
      className={cn(
        // Base layout
        'flex items-center justify-between px-4 py-3',
        // iOS styling
        'bg-background/95 backdrop-blur-xl',
        'border-b border-border/30',
        // Safe area handling
        isIOS && 'pt-safe-top',
        // Glass effect for iOS
        isIOS && 'shadow-sm',
        className
      )}
      variants={headerAnimations}
      initial="initial"
      animate="animate"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        // iOS specific backdrop
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left side - Logo/Title */}
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex flex-col">
          <h1 className={cn(
            'font-bold text-foreground',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground -mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </motion.div>

      {/* Right side - Actions */}
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Notifications */}
        {showNotifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationsClick}
            className={cn(
              'h-10 w-10 rounded-full',
              'hover:bg-muted/80 active:scale-95',
              'transition-all duration-200'
            )}
            style={{ touchAction: 'manipulation' }}
          >
            <Bell className="h-5 w-5" />
          </Button>
        )}

        {/* Settings */}
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className={cn(
              'h-10 w-10 rounded-full',
              'hover:bg-muted/80 active:scale-95',
              'transition-all duration-200'
            )}
            style={{ touchAction: 'manipulation' }}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        {/* User Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <Avatar className={cn(
            'h-8 w-8 ring-2 ring-border/50',
            'transition-all duration-200'
          )}>
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {profile?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      </motion.div>
    </motion.header>
  );
};
