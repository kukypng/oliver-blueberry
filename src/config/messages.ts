
// Mensagens e textos do sistema
export const MESSAGES_CONFIG = {
  // Mensagens de erro
  errors: {
    licenseExpired: 'Sua licença expirou ou não está ativa. Ative uma nova licença para continuar.',
    licenseInvalid: 'Código de licença inválido. Verifique e tente novamente.',
    licenseAlreadyUsed: 'Esta licença já está sendo utilizada por outro usuário.',
    authRequired: 'Usuário não encontrado. Faça login novamente.',
    genericError: 'Ocorreu um erro inesperado. Tente novamente.'
  },
  
  // Mensagens de sucesso
  success: {
    licenseActivated: 'Sua licença foi ativada com sucesso!',
    dataImported: 'Dados importados com sucesso!',
    profileUpdated: 'Perfil atualizado com sucesso!'
  },
  
  // Textos da interface
  ui: {
    backButton: 'Voltar',
    confirmButton: 'Confirmar',
    cancelButton: 'Cancelar',
    saveButton: 'Salvar',
    loadingButton: 'Carregando...',
    tryAgainButton: 'Tentar Novamente'
  },
  
  // Textos de marketing
  marketing: {
    heroTitle: 'Escolha seu Plano',
    heroSubtitle: 'Tenha acesso completo ao sistema de gestão de orçamentos mais eficiente para assistências técnicas.',
    ctaButton: 'Assinar Agora',
    supportIncluded: 'Suporte via WhatsApp incluso',
    additionalInfo: '✓ Sem taxa de setup • ✓ Cancele quando quiser • ✓ Suporte brasileiro'
  }
} as const;
