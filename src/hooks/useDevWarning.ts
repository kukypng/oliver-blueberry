import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DevWarningSettings {
  show_dev_warning: boolean;
  dev_warning_title: string;
  dev_warning_message: string;
}

export const useDevWarning = () => {
  const [settings, setSettings] = useState<DevWarningSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // iOS: timeout otimizado para fetch
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const { data, error } = await supabase
          .from('site_settings')
          .select('show_dev_warning, dev_warning_title, dev_warning_message')
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching dev warning settings:', error);
          return;
        }

        if (data) {
          setSettings({
            show_dev_warning: data.show_dev_warning || false,
            dev_warning_title: data.dev_warning_title || 'Funcionalidade em Desenvolvimento',
            dev_warning_message: data.dev_warning_message || 'Esta funcionalidade ainda está em desenvolvimento. Em breve estará disponível com melhorias completas.'
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching dev warning settings:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    showWarning: settings?.show_dev_warning || false,
    title: settings?.dev_warning_title || 'Funcionalidade em Desenvolvimento',
    message: settings?.dev_warning_message || 'Esta funcionalidade ainda está em desenvolvimento. Em breve estará disponível com melhorias completas.',
    loading
  };
};