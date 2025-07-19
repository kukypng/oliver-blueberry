
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useLicenseValidation = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['license-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc('is_license_valid', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error validating license:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};
