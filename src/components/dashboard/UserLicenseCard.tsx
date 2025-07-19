
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Calendar, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

export const UserLicenseCard = () => {
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
        urgent: true
      };
    }
    
    if (remainingDays <= 3) {
      return {
        status: 'Crítico',
        badgeVariant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        cardClass: 'border-red-200 bg-red-50/50',
        urgent: true
      };
    }
    
    if (remainingDays <= 7) {
      return {
        status: 'Atenção',
        badgeVariant: 'secondary' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        cardClass: 'border-orange-200 bg-orange-50/50',
        urgent: true
      };
    }
    
    return {
      status: 'Ativa',
      badgeVariant: 'default' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      cardClass: 'border-green-200 bg-green-50/50',
      urgent: false
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={`${statusConfig.cardClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Sua Licença</CardTitle>
          </div>
          <Badge variant={statusConfig.badgeVariant} className="flex items-center space-x-1">
            {statusConfig.icon}
            <span>{statusConfig.status}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Código da Licença</p>
            <p className="font-mono text-sm bg-background border rounded px-2 py-1">
              Licença Ativa
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Dias Restantes</p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`font-semibold ${remainingDays <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                {remainingDays > 0 ? `${remainingDays} dias` : 'Expirada'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Data de Expiração</p>
          <p className="text-sm">
            {format(expirationDate, "dd 'de' MMMM 'de' yyyy", { locale: require('date-fns/locale/pt-BR') })}
          </p>
        </div>

        {statusConfig.urgent && (
          <div className="pt-2">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Renovar via WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
