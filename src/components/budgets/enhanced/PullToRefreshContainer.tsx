import React from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { usePullToRefresh } from '../../../hooks/usePullToRefresh';

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  onRefresh,
  children,
  className = ''
}) => {
  const {
    pullDistance,
    isRefreshing,
    indicatorText,
    indicatorOpacity,
    handlers
  } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    resistance: 0.4
  });

  return (
    <div className={`relative ${className}`}>
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm transition-all duration-200"
        style={{
          height: `${Math.min(pullDistance, 80)}px`,
          opacity: indicatorOpacity,
          transform: `translateY(-${Math.max(0, 80 - pullDistance)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-primary">
          {isRefreshing ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <ChevronDown 
              className={`h-5 w-5 transition-transform duration-200 ${
                pullDistance >= 80 ? 'rotate-180' : ''
              }`} 
            />
          )}
          <span className="text-sm font-medium">{indicatorText}</span>
        </div>
        
        {/* Progress indicator */}
        <div className="w-12 h-1 bg-primary/20 rounded-full mt-2">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${Math.min(100, (pullDistance / 80) * 100)}%` }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="overflow-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          transform: `translateY(${isRefreshing ? '80px' : '0px'})`,
          transition: isRefreshing ? 'transform 0.3s ease-out' : 'none'
        }}
        {...handlers}
      >
        {children}
      </div>
    </div>
  );
};