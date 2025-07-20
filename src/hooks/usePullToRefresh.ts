import { useState, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = (options: PullToRefreshOptions) => {
  const {
    onRefresh,
    threshold = 80,
    resistance = 0.4
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollElement = e.currentTarget;
    
    // Só permitir pull-to-refresh se estiver no topo
    if (scrollElement.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
      setCanPull(true);
    } else {
      setCanPull(false);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canPull || isRefreshing) return;

    const scrollElement = e.currentTarget;
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    // Só fazer pull se estiver no topo e puxando para baixo
    if (scrollElement.scrollTop === 0 && deltaY > 0) {
      isDragging.current = true;
      
      // Aplicar resistência
      const resistantDelta = deltaY * resistance;
      setPullDistance(Math.min(resistantDelta, threshold * 1.5));
      
      // Prevenir scroll padrão
      e.preventDefault();
    }
  }, [canPull, isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || isRefreshing) return;

    const shouldRefresh = pullDistance >= threshold;
    
    if (shouldRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset
    setPullDistance(0);
    isDragging.current = false;
    setCanPull(false);
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  const getIndicatorText = () => {
    if (isRefreshing) return 'Atualizando...';
    if (pullDistance >= threshold) return 'Solte para atualizar';
    if (pullDistance > 0) return 'Puxe para atualizar';
    return '';
  };

  const getIndicatorOpacity = () => {
    return Math.min(pullDistance / threshold, 1);
  };

  return {
    pullDistance,
    isRefreshing,
    indicatorText: getIndicatorText(),
    indicatorOpacity: getIndicatorOpacity(),
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  };
};