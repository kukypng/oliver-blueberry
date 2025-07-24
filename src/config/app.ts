
// Configurações gerais do aplicativo
export const APP_CONFIG = {
  // Informações básicas do app
  name: 'OneDrip',
  fullName: 'OneDrip - Sistema de Gestão',
  description: 'Sistema completo de orçamentos para assistências técnicas',
  version: '2.1.2',
  
  // URLs e domínios
  domain: 'onedrip.com.br',
  website: 'https://onedrip.com.br',
  
  // Configurações de autenticação
  auth: {
    redirectUrl: '/dashboard',
    loginRedirectUrl: '/dashboard',
    signupRedirectUrl: '/dashboard',
    resetPasswordRedirectUrl: '/reset-password',
    verifyRedirectUrl: '/verify'
  },
  
  // Configurações de licença
  license: {
    trialDays: 2,
    defaultValidityDays: 30,
    codePrefix: '344333',
    codeLength: 13
  },
  
  // Configurações visuais
  branding: {
    logoPath: '/lovable-uploads/logoo.png',
    primaryColor: 'hsl(220, 70%, 50%)',
    favicon: '/favicon.ico'
  }
} as const;
