import React from 'react';

interface BudgetCardSkeletonProps {
  count?: number;
}

export const BudgetCardSkeleton: React.FC<BudgetCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Header skeleton */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                </div>
              </div>
              <div className="w-20 h-6 bg-muted rounded-full animate-pulse" />
            </div>

            {/* Service info skeleton */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="h-4 bg-muted rounded w-28 mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border mx-4" />

          {/* Footer skeleton */}
          <div className="p-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                <div>
                  <div className="h-6 bg-muted rounded w-24 mb-1 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-3 h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                </div>
                <div className="h-3 bg-muted rounded w-12 animate-pulse" />
              </div>
            </div>

            {/* Status indicators skeleton */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/50">
              <div className="w-12 h-5 bg-muted rounded-full animate-pulse" />
              <div className="w-16 h-5 bg-muted rounded-full animate-pulse" />
              <div className="w-14 h-3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};