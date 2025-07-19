import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, Plus } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useToast } from '@/hooks/use-toast';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, isInstallable, installApp } = usePWA();
  const device = useDeviceDetection();
  const { toast } = useToast();

  const handleInstall = async () => {
    if (device.isIOS) {
      toast({
        title: "Instalar Oliver",
        description: (
          <div className="space-y-2">
            <p>Para instalar no iPhone/iPad:</p>
            <div className="flex items-center gap-2 text-sm">
              <Share className="h-4 w-4" />
              <span>1. Toque no botão compartilhar</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" />
              <span>2. Selecione "Adicionar à Tela Inicial"</span>
            </div>
          </div>
        ),
        duration: 8000,
      });
    } else {
      const success = await installApp();
      if (success) {
        toast({
          title: "App Instalado!",
          description: "Oliver foi instalado com sucesso.",
        });
      }
    }
  };

  // Não mostrar se já estiver instalado
  if (isInstalled) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      <span>Instalar App</span>
    </Button>
  );
};