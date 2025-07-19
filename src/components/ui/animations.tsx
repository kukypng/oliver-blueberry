import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <div className={`page-enter ${className}`}>
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const StaggeredList = ({ children, delay = 0.1, className = "" }: StaggeredListProps) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div 
          key={index} 
          className="stagger-item"
          style={{ animationDelay: `${index * delay}s` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

interface AnimatedIconProps {
  children: React.ReactNode;
  variant?: 'bounce' | 'glow';
  className?: string;
}

export const AnimatedIcon = ({ children, variant = 'bounce', className = "" }: AnimatedIconProps) => {
  const variantClass = variant === 'bounce' ? 'icon-bounce' : 'icon-glow';
  
  return (
    <div className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
};