
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { differenceInDays, parseISO } from 'date-fns';
import { CreditCard, MessageCircle, HeartCrack, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LicenseStatus = () => {
  const { profile } = useAuth();

  if (!profile?.expiration_date) {
    return null;
  }

  const expirationDate = parseISO(profile.expiration_date);
  const today = new Date();
  const remainingDays = differenceInDays(expirationDate, today);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Gostaria de renovar minha licença do sistema.');
    const whatsappUrl = `https://wa.me/5564996028022?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatus = () => {
    if (remainingDays < 0) {
      return {
        title: "Licença Expirada",
        description: `Sua licença expirou. Renove para continuar usando o sistema.`,
        icon: <HeartCrack className="h-8 w-8 text-red-500" />,
        cardClass: "border-red-500/30 bg-gradient-to-br from-red-500/20 via-red-400/15 to-red-600/25",
        showRenew: true
      };
    }
    
    if (remainingDays <= 1) {
      const dayText = remainingDays === 1 ? 'amanhã' : 'hoje';
      return {
        title: `Urgente: Sua licença expira ${dayText}!`,
        description: `Renove para não perder o acesso ao sistema.`,
        icon: <HeartCrack className="h-8 w-8 text-red-500" />,
        cardClass: "border-red-500/50 bg-gradient-to-br from-red-600/30 via-red-500/25 to-red-700/35 shadow-red-500/20 shadow-lg animate-pulse",
        showRenew: true
      };
    }
    
    if (remainingDays <= 5) {
      return {
        title: "Atenção: Licença Expirando",
        description: `Sua licença expira em ${remainingDays} dias. Renove para não perder o acesso.`,
        icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
        cardClass: "border-orange-500/30 bg-gradient-to-br from-orange-500/20 via-orange-400/15 to-orange-600/25",
        showRenew: true
      };
    }
    
    if (remainingDays <= 10) {
      return {
        title: "Atenção: Licença Expirando",
        description: `Sua licença expira em ${remainingDays} dias. Renove para não perder o acesso.`,
        icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
        cardClass: "border-[#fec832]/40 bg-gradient-to-br from-[#fec832]/25 via-[#feca32]/20 to-[#feb532]/30 shadow-[#fec832]/15 shadow-md",
        showRenew: true
      };
    }

    return {
      title: "Licença Ativa",
      description: `Sua licença expira em ${remainingDays} dias.`,
      icon: null,
      cardClass: "border-green-500/20 bg-gradient-to-br from-green-500/10 via-green-400/8 to-green-600/15",
      showRenew: false
    };
  };

  const status = getStatus();

  return (
    <Card className={`glass-card shadow-strong animate-slide-up ${status.cardClass}`}>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center space-x-4">
          {status.icon}
          <div>
            <CardTitle className="text-xl lg:text-2xl font-bold text-foreground">
              {status.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-muted-foreground mb-6">
          {status.description}
        </p>
        {status.showRenew && (
          <Button
            onClick={handleWhatsAppContact}
            className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Renovar via WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
