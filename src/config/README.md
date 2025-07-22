# Sistema de Configuração Centralizada - OneDrip

Este diretório contém a configuração centralizada da aplicação, permitindo mudanças fáceis de marca e informações do sistema.

## 📁 Arquivos

- `app.ts` - Configuração principal da aplicação
- `README.md` - Este arquivo de documentação

## 🎯 Como Usar

### Importando a configuração completa:
```tsx
import { useAppConfig } from '@/hooks/useAppConfig';

const MyComponent = () => {
  const config = useAppConfig();
  
  return <h1>{config.fullName}</h1>;
};
```

### Usando hooks específicos:
```tsx
import { useAppInfo, useContactInfo } from '@/hooks/useAppConfig';

const Header = () => {
  const { name, logo } = useAppInfo();
  
  return (
    <div>
      <img src={logo} alt={`${name} Logo`} />
      <h1>{name}</h1>
    </div>
  );
};

const Footer = () => {
  const { email, whatsapp } = useContactInfo();
  
  return (
    <div>
      <p>Email: {email}</p>
      <p>WhatsApp: {whatsapp}</p>
    </div>
  );
};
```

## 🔄 Como Alterar o Nome da Aplicação

1. Abra o arquivo `src/config/app.ts`
2. Modifique as propriedades desejadas:
   ```typescript
   export const APP_CONFIG = {
     name: 'NovoNome',
     fullName: 'NovoNome - Sistema de Orçamentos',
     shortName: 'NovoNome',
     // ... outras configurações
   };
   ```
3. Salve o arquivo
4. Todas as referências na aplicação serão atualizadas automaticamente!

## ✅ Benefícios

- **Centralizado**: Todas as configurações em um só lugar
- **Tipado**: IntelliSense completo com TypeScript
- **Reutilizável**: Hooks específicos para diferentes necessidades
- **Manutenível**: Mudanças futuras são simples e rápidas
- **Consistente**: Garante que todas as referências sejam iguais

## 🚀 Próximos Passos

Após criar este sistema, os componentes da aplicação devem ser migrados para usar estes hooks ao invés de strings hardcoded. Isso garante que futuras mudanças de marca sejam feitas apenas alterando este arquivo de configuração.