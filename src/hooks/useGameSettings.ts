import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GameSettings {
  id?: string;
  speed_bug_spawn_rate: number;
  speed_bug_speed_multiplier: number;
  bug_spawn_percentage?: number;
  bug_damage?: number;
  hit_sound_enabled?: boolean;
  hit_sound_volume?: number;
  created_at?: string;
  updated_at?: string;
}

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar configurações:', error);
        setError(error.message);
        return;
      }

      setSettings(data);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      setError('Erro ao carregar configurações do jogo');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<GameSettings>) => {
    try {
      if (!settings?.id) return false;

      const { error } = await supabase
        .from('game_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        toast.error('Erro ao salvar configurações');
        return false;
      }

      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      toast.success('Configurações salvas com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      toast.error('Erro ao salvar configurações');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};