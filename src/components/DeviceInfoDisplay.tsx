import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Monitor, Smartphone, Tablet, Eye, EyeOff } from 'lucide-react';

export const DeviceInfoDisplay: React.FC = () => {
  const deviceInfo = useDeviceDetection();

  const getPlatformIcon = () => {
    switch (deviceInfo.platform) {
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getPlatformColor = () => {
    switch (deviceInfo.platform) {
      case 'desktop':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'mobile':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'tablet':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getPlatformIcon()}
          <CardTitle className="text-lg">Informações do Dispositivo</CardTitle>
        </div>
        <CardDescription>
          Detecção automática do tipo de dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plataforma Principal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plataforma:</span>
          <Badge className={getPlatformColor()}>
            {deviceInfo.platform.charAt(0).toUpperCase() + deviceInfo.platform.slice(1)}
          </Badge>
        </div>

        {/* Tipo de Dispositivo */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <Badge variant={deviceInfo.isDesktop ? "default" : "outline"} className="w-full">
              Desktop
            </Badge>
          </div>
          <div className="text-center">
            <Badge variant={deviceInfo.isMobile ? "default" : "outline"} className="w-full">
              Mobile
            </Badge>
          </div>
          <div className="text-center">
            <Badge variant={deviceInfo.isTablet ? "default" : "outline"} className="w-full">
              Tablet
            </Badge>
          </div>
        </div>

        {/* Características */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Touch Screen:</span>
            <Badge variant={deviceInfo.isTouch ? "default" : "outline"}>
              {deviceInfo.isTouch ? "Sim" : "Não"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Sistema:</span>
            <div className="flex gap-1">
              {deviceInfo.isIOS && <Badge variant="outline">iOS</Badge>}
              {deviceInfo.isAndroid && <Badge variant="outline">Android</Badge>}
              {!deviceInfo.isIOS && !deviceInfo.isAndroid && <Badge variant="outline">Outros</Badge>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">PWA Instalado:</span>
            <Badge variant={deviceInfo.isStandalone ? "default" : "outline"}>
              {deviceInfo.isStandalone ? "Sim" : "Não"}
            </Badge>
          </div>
        </div>

        {/* Funcionalidades PWA */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            {deviceInfo.isDesktop ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">Funcionalidades PWA:</span>
          </div>
          
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Notificações de Instalação:</span>
              <Badge variant={deviceInfo.isDesktop ? "destructive" : "default"} className="text-xs">
                {deviceInfo.isDesktop ? "Ocultas" : "Visíveis"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Notificações de Atualização:</span>
              <Badge variant={deviceInfo.isDesktop ? "destructive" : "default"} className="text-xs">
                {deviceInfo.isDesktop ? "Ocultas" : "Visíveis"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Indicador Offline:</span>
              <Badge variant={deviceInfo.isDesktop ? "destructive" : "default"} className="text-xs">
                {deviceInfo.isDesktop ? "Oculto" : "Visível"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tamanho da Tela */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Tamanho da Tela:</span>
          <Badge variant="outline" className="capitalize">
            {deviceInfo.screenSize}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};