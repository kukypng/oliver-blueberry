import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Calendar, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

export const UserLicenseCardIOS = () => {
  const { profile } = useAuth();
  const { data: isLicenseValid } = useLicenseValidation();

  if (!profile?.expiration_date) {
    return null;
  }

  const expirationDate = parseISO(profile.expiration_date);
  const today = new Date();
  const remainingDays = differenceInDays(expirationDate, today);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Gostaria de renovar minha licença do Oliver Blueberry.');
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusConfig = () => {
    if (remainingDays < 0) {
      return {
        status: 'Expirada',
        badgeVariant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        cardClass: 'border-red-200 bg-red-50/50',
        urgent: true,
        textColor: 'text-red-600'
      };
    }
    
    if (remainingDays <= 3) {
      return {
        status: 'Crítico',
        badgeVariant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        cardClass: 'border-red-200 bg-red-50/50',
        urgent: true,
        textColor: 'text-red-600'
      };
    }
    
    if (remainingDays <= 7) {
      return {
        status: 'Atenção',
        badgeVariant: 'secondary' as const,
        icon: <Clock className="h-4 w-4" />,
        cardClass: 'border-orange-200 bg-orange-50/50',
        urgent: true,
        textColor: 'text-orange-600'
      };
    }
    
    return {
      status: 'Ativa',
      badgeVariant: 'default' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      cardClass: 'border-green-200 bg-green-50/50',
      urgent: false,
      textColor: 'text-green-600'
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="w-full p-4" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <Card className={`${statusConfig.cardClass} shadow-lg`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/50 p-2 rounded-full">
                <Key className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg font-bold">Sua Licença</CardTitle>
            </div>
            <Badge variant={statusConfig.badgeVariant} className="flex items-center space-x-1 px-3 py-1">
              {statusConfig.icon}
              <span className="font-medium">{statusConfig.status}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">Código da Licença</p>
              <p className="font-mono text-sm bg-background border rounded px-3 py-2">
                Licença Ativa
              </p>
            </div>
            
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">Status da Licença</p>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className={`font-bold text-lg ${statusConfig.textColor}`}>
                    {remainingDays > 0 ? `${remainingDays} dias restantes` : 'Expirada'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Expira em {format(expirationDate, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {statusConfig.urgent && (
            <div className="pt-2">
              <Button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-base"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Renovar via WhatsApp
              </Button>
            </div>
          )}

          {!statusConfig.urgent && (
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">
                Sua licença está ativa e funcionando normalmente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};