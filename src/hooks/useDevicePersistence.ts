import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  lastSeen: string;
  trusted: boolean;
}

export const useDevicePersistence = () => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [isTrustedDevice, setIsTrustedDevice] = useState(false);

  // Gerar ou recuperar ID único do dispositivo
  const generateDeviceId = () => {
    let savedDeviceId = localStorage.getItem('device_fingerprint');
    
    if (!savedDeviceId) {
      // Criar fingerprint baseado em características do dispositivo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('DeviceFingerprint', 10, 10);
      const canvasFingerprint = canvas.toDataURL();
      
      const deviceData = {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvasFingerprint.slice(-50), // últimos 50 chars do canvas
        timestamp: Date.now()
      };
      
      savedDeviceId = btoa(JSON.stringify(deviceData)).slice(0, 32);
      localStorage.setItem('device_fingerprint', savedDeviceId);
    }
    
    return savedDeviceId;
  };

  // Verificar se dispositivo é confiável
  const checkTrustedDevice = async (userId: string) => {
    const deviceFingerprint = generateDeviceId();
    const trustedDevices = localStorage.getItem('trusted_devices');
    
    if (trustedDevices) {
      const devices = JSON.parse(trustedDevices);
      const isDeviceTrusted = devices.includes(deviceFingerprint);
      setIsTrustedDevice(isDeviceTrusted);
      
      if (isDeviceTrusted) {
        console.log('📱 Dispositivo confiável detectado');
        return true;
      }
    }
    
    return false;
  };

  // Marcar dispositivo como confiável
  const trustDevice = () => {
    const deviceFingerprint = generateDeviceId();
    const trustedDevices = localStorage.getItem('trusted_devices');
    
    let devices: string[] = [];
    if (trustedDevices) {
      devices = JSON.parse(trustedDevices);
    }
    
    if (!devices.includes(deviceFingerprint)) {
      devices.push(deviceFingerprint);
      localStorage.setItem('trusted_devices', JSON.stringify(devices));
      setIsTrustedDevice(true);
      console.log('✅ Dispositivo marcado como confiável');
    }
  };

  // Remover confiança do dispositivo
  const untrustDevice = () => {
    const deviceFingerprint = generateDeviceId();
    const trustedDevices = localStorage.getItem('trusted_devices');
    
    if (trustedDevices) {
      const devices = JSON.parse(trustedDevices);
      const filteredDevices = devices.filter((id: string) => id !== deviceFingerprint);
      localStorage.setItem('trusted_devices', JSON.stringify(filteredDevices));
      setIsTrustedDevice(false);
      console.log('❌ Confiança do dispositivo removida');
    }
  };

  // Atualizar último acesso do dispositivo
  const updateDeviceActivity = () => {
    const lastActivity = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    localStorage.setItem('last_device_activity', JSON.stringify(lastActivity));
  };

  // Verificar se deve manter login baseado na preferência do usuário
  const shouldMaintainLogin = (): boolean => {
    const userPreference = localStorage.getItem('supabase_user_preference');
    const lastActivity = localStorage.getItem('last_device_activity');
    
    if (userPreference === 'stay_logged_in' && lastActivity) {
      const activity = JSON.parse(lastActivity);
      const daysSinceLastActivity = (Date.now() - activity.timestamp) / (1000 * 60 * 60 * 24);
      
      // Manter login por até 30 dias se dispositivo for confiável
      return daysSinceLastActivity < 30 && isTrustedDevice;
    }
    
    return false;
  };

  useEffect(() => {
    const fingerprint = generateDeviceId();
    setDeviceId(fingerprint);
    
    // Atualizar atividade sempre que hook for usado
    updateDeviceActivity();
    
    // Verificar se é dispositivo confiável
    const savedTrustedDevices = localStorage.getItem('trusted_devices');
    if (savedTrustedDevices) {
      const devices = JSON.parse(savedTrustedDevices);
      setIsTrustedDevice(devices.includes(fingerprint));
    }
  }, []);

  return {
    deviceId,
    isTrustedDevice,
    checkTrustedDevice,
    trustDevice,
    untrustDevice,
    shouldMaintainLogin,
    updateDeviceActivity
  };
};