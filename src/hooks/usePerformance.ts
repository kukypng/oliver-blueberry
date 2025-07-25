/**
 * Performance Hook - Apple/iOS Optimization
 * Hook para otimizar performance e garantir 60fps
 */

import { useEffect, useCallback, useRef, useState } from 'react';

// Hook para detectar reduced motion preference
export const useReducedMotion = () => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return prefersReducedMotion;
};

// Hook para otimizar animações baseado na performance
export const usePerformanceOptimization = () => {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta > 0) {
      fpsRef.current = Math.round(1000 / delta);
    }
    
    lastTimeRef.current = now;
    frameRef.current = requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [measureFPS]);

  const shouldReduceAnimations = fpsRef.current < 30;
  const shouldDisableAnimations = fpsRef.current < 20;

  return {
    fps: fpsRef.current,
    shouldReduceAnimations,
    shouldDisableAnimations
  };
};

// Hook para lazy loading de componentes
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (!targetRef.current) return;

    observerRef.current = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return targetRef;
};

// Hook para debounce de animações
export const useAnimationDebounce = (callback: () => void, delay: number = 16) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Hook para otimizar scroll performance
export const useScrollOptimization = () => {
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      document.body.classList.add('is-scrolling');
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      document.body.classList.remove('is-scrolling');
    }, 150);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return isScrollingRef.current;
};

// Hook para memory management
export const useMemoryOptimization = () => {
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach(fn => fn());
    cleanupFunctionsRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
};

// Hook para battery optimization
export const useBatteryOptimization = () => {
  const [batteryLevel, setBatteryLevel] = useState<number>(1);
  const [isCharging, setIsCharging] = useState<boolean>(true);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level);
        setIsCharging(battery.charging);

        const updateBattery = () => {
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      });
    }
  }, []);

  const shouldReduceAnimations = batteryLevel < 0.2 && !isCharging;
  const shouldDisableAnimations = batteryLevel < 0.1 && !isCharging;

  return {
    batteryLevel,
    isCharging,
    shouldReduceAnimations,
    shouldDisableAnimations
  };
};

// Hook principal para performance
export const usePerformance = () => {
  const prefersReducedMotion = useReducedMotion();
  const { fps, shouldReduceAnimations: fpsReduce, shouldDisableAnimations: fpsDisable } = usePerformanceOptimization();
  const { shouldReduceAnimations: batteryReduce, shouldDisableAnimations: batteryDisable } = useBatteryOptimization();
  const isScrolling = useScrollOptimization();

  const shouldReduceAnimations = prefersReducedMotion || fpsReduce || batteryReduce;
  const shouldDisableAnimations = prefersReducedMotion || fpsDisable || batteryDisable;

  return {
    fps,
    isScrolling,
    prefersReducedMotion,
    shouldReduceAnimations,
    shouldDisableAnimations,
    performanceLevel: fps > 50 ? 'high' : fps > 30 ? 'medium' : 'low'
  };
};