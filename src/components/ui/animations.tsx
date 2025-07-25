/**
 * Componentes de Animação - OneDrip Design System Apple/iOS
 * Microinterações e animações reutilizáveis com padrões Apple
 */

import React from 'react';
import { motion, AnimatePresence, Variants, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

// Apple-style spring configurations
export const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 17 },
  snappy: { type: "spring" as const, stiffness: 500, damping: 25 },
  wobbly: { type: "spring" as const, stiffness: 180, damping: 12 },
  elastic: { type: "spring" as const, stiffness: 300, damping: 20 }
};

// Apple-style easing curves
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
  standard: [0.4, 0, 0.2, 1] as const
};

// Variantes de animação reutilizáveis
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Enhanced Fade In Up Animation with Apple physics
interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
  distance?: number;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({
  children,
  delay = 0,
  className,
  duration = 0.6,
  distance = 20
}) => (
  <motion.div
    initial={{ opacity: 0, y: distance }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration,
      delay,
      ease: easings.easeOut
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Enhanced Scale on Hover with haptic-like feedback
interface ScaleOnHoverProps {
  children: React.ReactNode;
  scale?: number;
  tapScale?: number;
  className?: string;
  springConfig?: typeof springConfigs.bouncy;
}

export const ScaleOnHover: React.FC<ScaleOnHoverProps> = ({
  children,
  scale = 1.02,
  tapScale = 0.97,
  className,
  springConfig = springConfigs.bouncy
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: tapScale }}
    transition={springConfig}
    className={cn("cursor-pointer", className)}
    style={{ cursor: 'pointer' }}
  >
    {children}
  </motion.div>
);

// Componente de loading skeleton animado
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular'
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted";

  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full aspect-square"
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
};

// Componente de transição de página
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Apple-style Stagger Animation with improved timing
interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export const StaggerList: React.FC<StaggerListProps> = ({
  children,
  className,
  staggerDelay = 0.08,
  initialDelay = 0
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: initialDelay
        }
      }
    }}
    className={className}
  >
    {React.Children.map(children, (child, index) => (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, y: 16, scale: 0.98 },
          visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: springConfigs.gentle
          }
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Componente de bounce para notificações
interface BounceProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  trigger = false,
  className
}) => (
  <motion.div
    animate={trigger ? { scale: [1, 1.1, 1] } : {}}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Componente de slide para modais
interface SlideModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const SlideModal: React.FC<SlideModalProps> = ({
  children,
  isOpen,
  onClose,
  direction = 'up'
}) => {
  const slideVariants = {
    up: { y: '100%' },
    down: { y: '-100%' },
    left: { x: '100%' },
    right: { x: '-100%' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={slideVariants[direction]}
            animate={{ x: 0, y: 0 }}
            exit={slideVariants[direction]}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Apple-style Slide In Animation
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'right' | 'left' | 'up' | 'down';
  delay?: number;
  className?: string;
  distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'right',
  delay = 0,
  className,
  distance = 30
}) => {
  const directions = {
    right: { x: distance, y: 0 },
    left: { x: -distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: easings.easeOut
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Bounce In Animation (Apple-style)
interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const BounceIn: React.FC<BounceInProps> = ({
  children,
  delay = 0,
  className
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.3 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Elastic Scale Animation
interface ElasticScaleProps {
  children: React.ReactNode;
  className?: string;
}

export const ElasticScale: React.FC<ElasticScaleProps> = ({
  children,
  className
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={springConfigs.elastic}
    className={className}
  >
    {children}
  </motion.div>
);

// Smooth Reveal Animation (for scroll-triggered content)
interface SmoothRevealProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export const SmoothReveal: React.FC<SmoothRevealProps> = ({
  children,
  className,
  threshold = 0.1
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { threshold, once: true });
  const controls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.6,
            ease: easings.easeOut
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Ripple Effect Component
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className
}) => {
  const [ripples, setRipples] = React.useState<Array<{
    x: number;
    y: number;
    size: number;
    id: number;
  }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Floating Animation (subtle hover effect)
interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className
}) => (
  <motion.div
    animate={{ 
      y: [0, -4, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Pulse Animation (for notifications/alerts)
interface PulseAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  className
}) => (
  <motion.div
    animate={{ 
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Shake Animation (for errors)
interface ShakeAnimationProps {
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  className,
  trigger = false
}) => (
  <motion.div
    animate={trigger ? {
      x: [0, -4, 4, -4, 4, 0],
    } : {}}
    transition={{
      duration: 0.5,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Hook para animações de scroll aprimorado
export const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};