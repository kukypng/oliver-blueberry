import React from 'react';
import { HeartCrack, AlertTriangle, MessageCircle } from 'lucide-react';

interface DashboardLiteLicenseStatusProps {
  profile: any;
}

export const DashboardLiteLicenseStatus = ({ profile }: DashboardLiteLicenseStatusProps) => {
  if (!profile?.expiration_date) {
    return null;
  }

  const expirationDate = new Date(profile.expiration_date);
  const today = new Date();
  const remainingDays = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Gostaria de renovar minha licença do sistema.');
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatus = () => {
    if (remainingDays < 0) {
      return {
        title: "Licença Expirada",
        description: `Sua licença expirou. Renove para continuar usando o sistema.`,
        icon: <HeartCrack className="h-6 w-6 text-red-500" />,
        cardClass: "border-red-500/30 bg-red-500/10",
        showRenew: true
      };
    }
    
    if (remainingDays <= 1) {
      const dayText = remainingDays === 1 ? 'amanhã' : 'hoje';
      return {
        title: `Urgente: Sua licença expira ${dayText}!`,
        description: `Renove para não perder o acesso ao sistema.`,
        icon: <HeartCrack className="h-6 w-6 text-red-500" />,
        cardClass: "border-red-500/50 bg-red-500/20",
        showRenew: true
      };
    }
    
    if (remainingDays <= 5) {
      return {
        title: "Atenção: Licença Expirando",
        description: `Sua licença expira em ${remainingDays} dias. Renove para não perder o acesso.`,
        icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
        cardClass: "border-orange-500/30 bg-orange-500/10",
        showRenew: true
      };
    }
    
    if (remainingDays <= 10) {
      return {
        title: "Atenção: Licença Expirando",
        description: `Sua licença expira em ${remainingDays} dias. Renove para não perder o acesso.`,
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        cardClass: "border-yellow-500/30 bg-yellow-500/10",
        showRenew: true
      };
    }

    return {
      title: "Licença Ativa",
      description: `Sua licença expira em ${remainingDays} dias.`,
      icon: null,
      cardClass: "border-green-500/20 bg-green-500/10",
      showRenew: false
    };
  };

  const status = getStatus();

  return (
    <div className={`bg-card border rounded-lg p-4 mb-4 ${status.cardClass}`}>
      <div className="flex items-center gap-3 mb-3">
        {status.icon}
        <h3 className="text-lg font-semibold text-foreground">
          {status.title}
        </h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {status.description}
      </p>
      
      {status.showRenew && (
        <button
          onClick={handleWhatsAppContact}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Renovar via WhatsApp
        </button>
      )}
    </div>
  );
};