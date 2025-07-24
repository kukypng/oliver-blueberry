
// Arquivo principal de configuração - importa e exporta todas as configurações
export { APP_CONFIG } from './app';
export { CONTACT_CONFIG } from './contacts';
export { PAYMENT_CONFIG } from './payment';
export { MESSAGES_CONFIG } from './messages';
export { FEATURES_CONFIG } from './features';
export { URLS_CONFIG } from './urls';

// Configuração centralizada para fácil acesso
export const CONFIG = {
  app: () => import('./app').then(m => m.APP_CONFIG),
  contacts: () => import('./contacts').then(m => m.CONTACT_CONFIG),
  payment: () => import('./payment').then(m => m.PAYMENT_CONFIG),
  messages: () => import('./messages').then(m => m.MESSAGES_CONFIG),
  features: () => import('./features').then(m => m.FEATURES_CONFIG),
  urls: () => import('./urls').then(m => m.URLS_CONFIG)
} as const;

// Helper para WhatsApp
export const getWhatsAppUrl = (message?: string) => {
  const { CONTACT_CONFIG } = require('./contacts');
  const baseMessage = message || CONTACT_CONFIG.whatsapp.supportMessage;
  const encodedMessage = encodeURIComponent(baseMessage);
  return `https://wa.me/${CONTACT_CONFIG.whatsapp.number}?text=${encodedMessage}`;
};

// Helper para URLs de pagamento
export const getPaymentUrl = (planType?: string) => {
  const { PAYMENT_CONFIG } = require('./payment');
  return PAYMENT_CONFIG.mercadoPago.defaultPaymentUrl;
};

// Helper para validação de licença
export const getLicenseValidation = () => {
  const { APP_CONFIG } = require('./app');
  return {
    prefix: APP_CONFIG.license.codePrefix,
    length: APP_CONFIG.license.codeLength,
    isValidFormat: (code: string) => {
      return code.startsWith(APP_CONFIG.license.codePrefix) && 
             code.length === APP_CONFIG.license.codeLength;
    }
  };
};
