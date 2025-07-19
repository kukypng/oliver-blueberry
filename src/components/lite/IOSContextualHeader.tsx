import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IOSContextualHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  rightAction?: React.ReactNode;
  safeAreaTop?: number;
}

export const IOSContextualHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  onRefresh,
  isRefreshing = false,
  rightAction,
  safeAreaTop = 0
}: IOSContextualHeaderProps) => {
  return (
    <div 
      className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50"
      style={{ paddingTop: `max(${safeAreaTop}px, 8px)` }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 hover:bg-muted transition-colors",
                  isRefreshing && "opacity-75"
                )}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <RefreshCw className={cn(
                  "h-5 w-5 text-foreground",
                  isRefreshing && "animate-spin"
                )} />
              </button>
            )}
            {rightAction}
          </div>
        </div>
      </div>
    </div>
  );
};