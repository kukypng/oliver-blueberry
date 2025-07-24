import { 
  APP_CONFIG, 
  CONTACT_CONFIG, 
  PAYMENT_CONFIG, 
  MESSAGES_CONFIG, 
  FEATURES_CONFIG, 
  URLS_CONFIG,
  getWhatsAppUrl,
  getPaymentUrl
} from '@/config';
import { applyConfigReplacements } from '@/utils/configReplacements';

/**
 * Hook centralizado para acessar todas as configurações do app
 * Garante que mudanças na pasta config sejam aplicadas em todo o app
 */
export const useAppConfig = () => {
  return {
    // Configurações do app
    app: APP_CONFIG,
    
    // Configurações de contato
    contacts: CONTACT_CONFIG,
    
    // Configurações de pagamento
    payment: PAYMENT_CONFIG,
    
    // Mensagens do sistema
    messages: MESSAGES_CONFIG,
    
    // Funcionalidades ativas/inativas
    features: FEATURES_CONFIG,
    
    // URLs do sistema
    urls: URLS_CONFIG,
    
    // Helpers úteis
    helpers: {
      getWhatsAppUrl,
      getPaymentUrl,
      
      // WhatsApp com mensagem personalizada
      getWhatsAppSupportUrl: (message?: string) => 
        getWhatsAppUrl(message || CONTACT_CONFIG.whatsapp.supportMessage),
      
      // WhatsApp para cliente específico
      getWhatsAppClientUrl: (phone: string, message?: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const finalMessage = message || 'Olá! Entro em contato através do sistema de gestão.';
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
      },
      
      // URL de renovação de licença
      getLicenseRenewalWhatsApp: () => 
        getWhatsAppUrl('Olá! Gostaria de renovar minha licença do sistema.'),
      
      // URL de suporte técnico
      getTechnicalSupportWhatsApp: () => 
        getWhatsAppUrl('Olá! Preciso de suporte técnico com o sistema.'),
    }
  };
};

/**
 * Hook simplificado apenas para configurações do app
 */
export const useAppInfo = () => {
  const { app } = useAppConfig();
  return {
    name: app.name,
    fullName: app.fullName,
    description: app.description,
    version: app.version,
    logoPath: app.branding.logoPath,
    domain: app.domain,
    website: app.website
  };
};

/**
 * Hook simplificado para contatos
 */
export const useContacts = () => {
  const { contacts, helpers } = useAppConfig();
  return {
    ...contacts,
    getWhatsAppUrl: helpers.getWhatsAppSupportUrl,
    getClientWhatsApp: helpers.getWhatsAppClientUrl,
    getLicenseRenewalWhatsApp: helpers.getLicenseRenewalWhatsApp,
    getTechnicalSupportWhatsApp: helpers.getTechnicalSupportWhatsApp
  };
};

/**
 * Hook para aplicar configurações em textos hardcoded
 */
export const useConfigText = () => {
  return {
    replace: applyConfigReplacements,
    // Helpers para casos comuns
    appName: APP_CONFIG.name,
    appFullName: APP_CONFIG.fullName,
    logoAlt: `${APP_CONFIG.name} Logo`,
    withAppName: (text: string) => text.replace('Oliver', APP_CONFIG.name)
  };
};