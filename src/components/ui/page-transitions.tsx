/**
 * Page Transitions - Apple/iOS Design System
 * Transições cinematográficas entre páginas com física natural
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Apple-style transition variants
const transitionVariants = {
  // Slide transitions (iOS navigation style)
  slideRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  
  slideLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  },
  
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 }
  },
  
  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 }
  },

  // Fade transitions
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },

  // Scale transitions (modal style)
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  },

  // Zoom transitions
  zoom: {
    initial: { scale: 1.1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  },

  // Flip transitions
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 }
  },

  // Parallax-style depth transition
  depth: {
    initial: { z: -100, scale: 0.8, opacity: 0 },
    animate: { z: 0, scale: 1, opacity: 1 },
    exit: { z: 100, scale: 1.2, opacity: 0 }
  }
};

// Spring configurations for different transition types
const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 17 },
  snappy: { type: "spring" as const, stiffness: 500, damping: 25 },
  smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  type?: keyof typeof transitionVariants;
  duration?: number;
  spring?: keyof typeof springConfigs;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'slideRight',
  spring = 'bouncy',
  className
}) => {
  const location = useLocation();
  const variants = transitionVariants[type];
  const transition = springConfigs[spring];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={cn("w-full h-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Route-based transition wrapper
interface RouteTransitionProps {
  children: React.ReactNode;
  routes: Record<string, keyof typeof transitionVariants>;
  defaultTransition?: keyof typeof transitionVariants;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  routes,
  defaultTransition = 'slideRight'
}) => {
  const location = useLocation();
  const transitionType = routes[location.pathname] || defaultTransition;

  return (
    <PageTransition type={transitionType}>
      {children}
    </PageTransition>
  );
};

// Shared element transition
interface SharedElementProps {
  children: React.ReactNode;
  layoutId: string;
  className?: string;
}

export const SharedElement: React.FC<SharedElementProps> = ({
  children,
  layoutId,
  className
}) => (
  <motion.div
    layoutId={layoutId}
    className={className}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 25
    }}
  >
    {children}
  </motion.div>
);

// Staggered page content animation
interface StaggeredContentProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredContent: React.FC<StaggeredContentProps> = ({
  children,
  staggerDelay = 0.1,
  className
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
          staggerChildren: staggerDelay,
          delayChildren: 0.2
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

// Parallax scroll transition
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className
}) => {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={className}
      style={{
        y: scrollY * speed
      }}
    >
      {children}
    </motion.div>
  );
};

// Hero section with animated background
interface AnimatedHeroProps {
  children: React.ReactNode;
  backgroundElements?: React.ReactNode[];
  className?: string;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  children,
  backgroundElements = [],
  className
}) => (
  <div className={cn("relative overflow-hidden", className)}>
    {/* Animated background elements */}
    <div className="absolute inset-0">
      {backgroundElements.map((element, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: index * 0.2,
            duration: 1,
            ease: "easeOut"
          }}
        >
          {element}
        </motion.div>
      ))}
    </div>

    {/* Content */}
    <div className="relative z-10">
      <StaggeredContent staggerDelay={0.15}>
        {React.Children.toArray(children)}
      </StaggeredContent>
    </div>
  </div>
);

// Modal transition wrapper
interface ModalTransitionProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: 'scale' | 'slideUp' | 'fade';
  className?: string;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  isOpen,
  onClose,
  children,
  type = 'scale',
  className
}) => {
  const variants = transitionVariants[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={springConfigs.bouncy}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51",
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Tab transition wrapper
interface TabTransitionProps {
  activeTab: string;
  children: Record<string, React.ReactNode>;
  className?: string;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  activeTab,
  children,
  className
}) => (
  <div className={cn("relative", className)}>
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {children[activeTab]}
      </motion.div>
    </AnimatePresence>
  </div>
);

// Loading transition
interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  loadingComponent,
  className
}) => (
  <div className={cn("relative", className)}>
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loadingComponent || (
            <div className="flex items-center justify-center py-12">
              <motion.div
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);