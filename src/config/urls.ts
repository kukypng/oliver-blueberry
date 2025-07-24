
// URLs e endpoints importantes
export const URLS_CONFIG = {
  // URLs de redirecionamento
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/',
    afterSignup: '/dashboard',
    afterLicenseActivation: '/dashboard',
    afterPayment: '/dashboard',
    unauthorizedAccess: '/auth',
    licenseExpired: '/license-expired'
  },
  
  // URLs externas
  external: {
    documentation: 'https://docs.oliverblueberry.com',
    support: 'https://wa.me/556496028022',
    website: 'https://oliverblueberry.com',
    terms: 'https://oliverblueberry.com/termos',
    privacy: 'https://oliverblueberry.com/privacidade'
  },
  
  // APIs e integrações
  api: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  
  // URLs para desenvolvimento
  development: {
    localUrl: 'http://localhost:5173',
    stagingUrl: 'https://c3a6a8a8-ef0a-4c63-b259-2ec5e9bd4572.lovableproject.com'
  }
} as const;
