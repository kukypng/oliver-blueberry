import { 
  APP_CONFIG, 
  CONTACT_CONFIG, 
  PAYMENT_CONFIG, 
  MESSAGES_CONFIG
} from '@/config';

/**
 * Utilitário para substituir todos os textos hardcoded pelos valores da configuração
 * Execute este comando para migrar automaticamente todo o app
 */

// Mapeamento de substituições automáticas
export const TEXT_REPLACEMENTS = {
  // Nome do app
  'Oliver': APP_CONFIG.name,
  'Oliver - Sistema de Gestão': APP_CONFIG.fullName,
  'Oliver Logo': `${APP_CONFIG.name} Logo`,
  'do Oliver': `do ${APP_CONFIG.name}`,
  'o Oliver': `o ${APP_CONFIG.name}`,
  'Oliver transformou': `${APP_CONFIG.name} transformou`,
  'Bem-vindo ao Oliver!': `Bem-vindo ao ${APP_CONFIG.name}!`,
  'Sistema Oliver Blueberry': `Sistema ${APP_CONFIG.name}`,
  'Oliver Design System': `${APP_CONFIG.name} Design System`,
  
  // Mensagens específicas
  'licença do Oliver': `licença do ${APP_CONFIG.name}`,
  'minha licença do Oliver': `minha licença do ${APP_CONFIG.name}`,
  'Instalar Oliver': `Instalar ${APP_CONFIG.name}`,
  'Oliver foi instalado': `${APP_CONFIG.name} foi instalado`,
  'Vantagens do Oliver': `Vantagens do ${APP_CONFIG.name}`,
  'sobre o Oliver': `sobre o ${APP_CONFIG.name}`,
  'já usa o Oliver': `já usa o ${APP_CONFIG.name}`,
  'utilizam o Oliver': `utilizam o ${APP_CONFIG.name}`,
  
  // Contatos
  '556496028022': CONTACT_CONFIG.whatsapp.number,
  '5564996028022': CONTACT_CONFIG.whatsapp.number,
  '(64) 9602-8022': CONTACT_CONFIG.whatsapp.fullNumber,
  
  // URLs
  'oliverblueberry.com': APP_CONFIG.domain,
  'https://oliverblueberry.com': APP_CONFIG.website,
  
  // Logos
  '/lovable-uploads/logoo.png': APP_CONFIG.branding.logoPath,
  
  // Mensagens do WhatsApp
  'Olá! Gostaria de renovar minha licença do Oliver.': CONTACT_CONFIG.whatsapp.supportMessage,
  'Olá! Preciso de ajuda com minha licença do Oliver.': CONTACT_CONFIG.whatsapp.supportMessage,
} as const;

// Função para aplicar substituições em uma string
export const applyConfigReplacements = (text: string): string => {
  let result = text;
  
  Object.entries(TEXT_REPLACEMENTS).forEach(([original, replacement]) => {
    result = result.replace(new RegExp(original, 'g'), replacement);
  });
  
  return result;
};

// Helper para componentes que ainda têm texto hardcoded
export const useConfigText = (originalText: string) => {
  return applyConfigReplacements(originalText);
};