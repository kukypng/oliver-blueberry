import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDevicePersistence } from './useDevicePersistence';
import { debugLog, debugError } from '@/utils/debugLogger';

export const useSessionRecovery = () => {
  const { shouldMaintainLogin, isTrustedDevice, updateDeviceActivity } = useDevicePersistence();

  const attemptSessionRecovery = useCallback(async () => {
    if (!shouldMaintainLogin() || !isTrustedDevice) {
      debugLog('Sessão não deve ser recuperada', { shouldMaintainLogin: shouldMaintainLogin(), isTrustedDevice });
      return null;
    }

    try {
      debugLog('Tentando recuperar sessão...');
      
      // Tentar obter sessão atual primeiro
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        debugLog('Sessão atual encontrada, atualizando atividade');
        updateDeviceActivity();
        return currentSession;
      }

      // Se não há sessão atual, tentar refresh
      debugLog('Tentando refresh da sessão...');
      const { data: refreshData, error } = await supabase.auth.refreshSession();
      
      if (error) {
        debugError('Erro no refresh da sessão', error);
        return null;
      }

      if (refreshData?.session) {
        debugLog('Sessão recuperada com sucesso via refresh');
        updateDeviceActivity();
        return refreshData.session;
      }

      debugLog('Nenhuma sessão recuperável encontrada');
      return null;
    } catch (error) {
      debugError('Erro na recuperação de sessão', error);
      return null;
    }
  }, [shouldMaintainLogin, isTrustedDevice, updateDeviceActivity]);

  const clearRecoveryData = useCallback(() => {
    debugLog('Limpando dados de recuperação de sessão');
    localStorage.removeItem('supabase_session_timestamp');
    localStorage.removeItem('supabase_user_preference');
    localStorage.removeItem('last_device_activity');
  }, []);

  return {
    attemptSessionRecovery,
    clearRecoveryData,
    canRecover: shouldMaintainLogin() && isTrustedDevice
  };
};