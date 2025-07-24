
// Configurações de funcionalidades e recursos
export const FEATURES_CONFIG = {
  // Funcionalidades ativas/inativas
  enabled: {
    socialLogin: true,
    appleLogin: true,
    googleLogin: true,
    pwaInstall: true,
    offlineMode: true,
    pushNotifications: false,
    analytics: true,
    debugMode: false
  },
  
  // Configurações de dados
  data: {
    maxImportSize: 5000, // número máximo de registros por importação
    maxFileSize: 10 * 1024 * 1024, // 10MB em bytes
    allowedFileTypes: ['.csv', '.xlsx', '.xls'],
    exportFormats: ['csv', 'xlsx', 'pdf']
  },
  
  // Configurações de interface
  ui: {
    itemsPerPage: 20,
    maxRecentItems: 10,
    autoSaveInterval: 30000, // 30 segundos
    sessionTimeout: 30 * 60 * 1000 // 30 minutos
  },
  
  // Configurações de performance
  performance: {
    enableVirtualization: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
    maxCacheSize: 100,
    lazyLoadImages: true
  }
} as const;
