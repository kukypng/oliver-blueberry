
// Configurações de pagamento e planos
export const PAYMENT_CONFIG = {
  // MercadoPago
  mercadoPago: {
    defaultPaymentUrl: 'https://mpago.la/246f2WV',
    scriptUrl: 'https://secure.mlstatic.com/mptools/render.js'
  },
  
  // Configurações de planos
  plans: {
    professional: {
      name: 'Plano Profissional',
      price: 85,
      currency: 'R$',
      period: '/mês',
      description: 'Para assistências técnicas que querem crescer',
      features: [
        'Sistema completo de orçamentos',
        'Gestão de clientes ilimitada',
        'Relatórios e estatísticas',
        'Cálculos automáticos',
        'Controle de dispositivos',
        'Suporte técnico incluso',
        'Atualizações gratuitas',
        'Backup automático'
      ]
    }
  },
  
  // Configurações de moeda
  currency: {
    default: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR'
  }
} as const;
