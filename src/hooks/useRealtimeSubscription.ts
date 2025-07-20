
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  onUpdate: () => void;
  debounceMs?: number;
  enabled?: boolean;
}

export const useRealtimeSubscription = ({
  table,
  filter,
  onUpdate,
  debounceMs = 500,
  enabled = true
}: UseRealtimeSubscriptionOptions) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  const debouncedUpdate = useCallback(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onUpdate();
      debounceTimerRef.current = null;
    }, debounceMs);
  }, [onUpdate, debounceMs]);

  useEffect(() => {
    if (!enabled) return;

    // Setup subscription with optimized channel name
    const channelName = `realtime_${table}_${filter || 'all'}`;
    
    subscriptionRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          debouncedUpdate();
        }
      )
      .subscribe();

    return () => {
      // Clean up debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Remove subscription
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [table, filter, enabled, debouncedUpdate]);

  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }
  }, []);

  return { cleanup };
};
