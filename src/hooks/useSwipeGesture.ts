import { useState, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  resistance?: number;
}

export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    resistance = 0.3
  } = options;

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
    setIsActive(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Aplicar resistência para limitar o swipe
    const resistantDelta = deltaX * resistance;
    setSwipeOffset(resistantDelta);

    // Prevenir scroll vertical durante swipe horizontal
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }, [resistance]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;

    const deltaX = currentX.current - startX.current;
    const absDistance = Math.abs(deltaX);

    if (absDistance > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset
    isDragging.current = false;
    setIsActive(false);
    setSwipeOffset(0);
  }, [threshold, onSwipeLeft, onSwipeRight]);

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setIsActive(false);
    isDragging.current = false;
  }, []);

  return {
    swipeOffset,
    isActive,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetSwipe
  };
};