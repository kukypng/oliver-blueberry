# 🔧 Sistema de Configuração Centralizada

## ✅ O que já está integrado:

### Componentes atualizados para usar a configuração:
- ✅ AdaptiveLayout (logo e nome do app)
- ✅ TabletHeaderNav (logo e nome)
- ✅ SecuritySettings (WhatsApp de suporte)
- ✅ HelpAndSupport (WhatsApp)
- ✅ Index (logo, nome, WhatsApp)
- ✅ PurchaseSuccessPage (logo, nome, WhatsApp)
- ✅ PlansHero (logo, nome, textos)

### Como usar nos componentes:

```tsx
import { useAppInfo, useContacts, useAppConfig } from '@/hooks/useAppConfig';

// Para info básica do app
const appInfo = useAppInfo();
console.log(appInfo.name); // "OneDrip"
console.log(appInfo.logoPath); // "/lovable-uploads/logoo.png"

// Para contatos
const contacts = useContacts();
contacts.getWhatsAppUrl(); // URL do WhatsApp com mensagem
contacts.getClientWhatsApp('11999999999', 'Oi!'); // Para clientes

// Para configuração completa
const { app, payment, messages } = useAppConfig();
```

## 📝 Para continuar a migração:

Substituir valores hardcoded restantes por:
- `appInfo.name` em vez de "Oliver"
- `appInfo.logoPath` em vez de "/lovable-uploads/logoo.png"
- `contacts.getWhatsAppUrl()` em vez de "https://wa.me/556496028022"
- `payment.plans.professional.price` para preços
- `messages.errors.licenseExpired` para mensagens

**Agora você pode editar qualquer coisa em `/src/config/` e será aplicado automaticamente em todo o app!**