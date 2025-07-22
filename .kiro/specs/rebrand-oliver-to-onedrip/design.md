# Design Document

## Overview

Este documento descreve a arquitetura e estratégia para substituir completamente a marca "Oliver" por "OneDrip" em todo o sistema. A abordagem será sistemática, cobrindo todos os pontos de contato da marca, desde arquivos de configuração até interface do usuário, garantindo consistência e integridade do sistema.

## Architecture

### Categorização dos Arquivos Afetados

**1. Arquivos de Configuração e Metadados**
- `index.html` - Meta tags, títulos, PWA configs
- `package.json` - Metadados do projeto
- `public/manifest.json` - Configurações PWA
- `capacitor.config.ts` - Configurações mobile

**2. Documentação**
- `README.md` - Documentação principal
- `LICENSE` - Arquivo de licença
- `SECURITY.md` - Documentação de segurança
- `*.md` - Outros arquivos de documentação

**3. Código da Aplicação**
- Componentes React (`.tsx`)
- Hooks personalizados (`.ts`)
- Páginas da aplicação
- Utilitários e configurações

**4. Banco de Dados**
- Migrações SQL
- Dados padrão e exemplos
- Configurações do sistema

## Components and Interfaces

### 1. Sistema de Substituição de Strings

**Estratégia de Busca e Substituição:**
- Busca case-sensitive por "Oliver"
- Substituição direta por "OneDrip"
- Verificação de contexto para evitar substituições incorretas

**Padrões de Substituição:**
```
"Oliver" → "OneDrip"
"oliver" → "onedrip" (quando em contexto de URLs/emails)
"OLIVER" → "ONEDRIP" (quando em constantes)
```

### 2. Componentes de Interface

**Componentes Afetados:**
- `TabletHeaderNav.tsx` - Logo e título do header
- `PlansHero.tsx` - Título principal dos planos
- `PWAInstallPrompt.tsx` - Nome da aplicação para instalação
- Páginas de autenticação e sucesso
- Componentes de demonstração

**Estratégia de Atualização:**
- Substituição direta em strings hardcoded
- Atualização de alt texts de imagens
- Modificação de títulos e labels

### 3. Sistema de Configurações

**Configurações PWA:**
- Título da aplicação
- Nome curto para instalação
- Metadados de compartilhamento

**Configurações de Banco:**
- Dados padrão em migrações
- Títulos de seções
- Textos de exemplo

## Data Models

### Arquivos de Configuração Afetados

**HTML Meta Tags:**
```html
<title>OneDrip - Sistema de Orçamentos</title>
<meta property="og:title" content="OneDrip - Sistema de Orçamentos" />
<meta property="og:site_name" content="OneDrip" />
<meta name="apple-mobile-web-app-title" content="OneDrip" />
```

**Manifest PWA:**
```json
{
  "name": "OneDrip - Sistema de Orçamentos",
  "short_name": "OneDrip"
}
```

**Dados do Banco:**
```sql
-- Exemplos de substituições em migrações
'Vantagens do OneDrip'
'Depoimentos reais de quem já usa o OneDrip'
'Mais de 500+ assistências técnicas já confiam no OneDrip'
```

## Error Handling

### Validação de Substituições

**Verificações Necessárias:**
1. Confirmar que todas as ocorrências foram encontradas
2. Verificar se não há quebras de funcionalidade
3. Validar que URLs e emails foram atualizados corretamente
4. Confirmar que metadados PWA estão corretos

**Rollback Strategy:**
- Manter backup dos arquivos originais
- Possibilidade de reverter mudanças se necessário
- Testes de funcionalidade após cada grupo de mudanças

### Tratamento de Casos Especiais

**URLs e Emails:**
- `contato@oliver.com` → `contato@onedrip.com`
- `suporte@oliver.com` → `suporte@onedrip.com`
- `bugs@oliver.com.br` → `bugs@onedrip.com.br`

**Contextos Técnicos:**
- Comentários de código
- Nomes de sistemas em documentação
- Referências em logs e debug

## Testing Strategy

### Testes de Funcionalidade

**1. Testes de Interface:**
- Verificar se todos os títulos foram atualizados
- Confirmar que logos e textos estão corretos
- Testar instalação PWA com novo nome

**2. Testes de Configuração:**
- Validar metadados de compartilhamento
- Confirmar funcionamento de notificações
- Testar configurações de PWA

**3. Testes de Banco de Dados:**
- Verificar se migrações executam corretamente
- Confirmar que dados padrão estão atualizados
- Testar funcionalidades que dependem de configurações

### Validação de Qualidade

**Checklist de Verificação:**
- [ ] Todos os títulos de página atualizados
- [ ] Componentes de interface atualizados
- [ ] Documentação atualizada
- [ ] Configurações PWA atualizadas
- [ ] Dados de banco atualizados
- [ ] Emails e URLs de contato atualizados
- [ ] Comentários de código atualizados

**Testes de Regressão:**
- Funcionalidades principais mantidas
- Autenticação funcionando
- Geração de PDFs funcionando
- Sistema de orçamentos operacional
- Dashboard e relatórios funcionais

## Centralized Configuration System

### App Configuration Structure

**Arquivo de Configuração Central:**
```typescript
// src/config/app.ts
export const APP_CONFIG = {
  name: 'OneDrip',
  fullName: 'OneDrip - Sistema de Orçamentos',
  shortName: 'OneDrip',
  description: 'O melhor sistema de orçamentos para sua empresa',
  logo: '/lovable-uploads/logoo.png',
  contact: {
    email: 'contato@onedrip.com',
    support: 'suporte@onedrip.com',
    security: 'bugs@onedrip.com.br',
    whatsapp: '(64) 9602-8022'
  },
  urls: {
    main: 'https://kuky.pro',
    plans: 'https://kuky.pro/plans'
  }
} as const;
```

**Hook para Acesso à Configuração:**
```typescript
// src/hooks/useAppConfig.ts
import { APP_CONFIG } from '@/config/app';

export const useAppConfig = () => {
  return APP_CONFIG;
};
```

### Integration Strategy

**Componentes Atualizados:**
- Todos os componentes que atualmente usam "Oliver" hardcoded
- Hooks de PWA e compartilhamento
- Páginas de autenticação e marketing
- Configurações de site

**Padrão de Uso:**
```typescript
import { useAppConfig } from '@/hooks/useAppConfig';

const MyComponent = () => {
  const { name, fullName, contact } = useAppConfig();
  
  return (
    <div>
      <h1>{fullName}</h1>
      <p>Entre em contato: {contact.email}</p>
    </div>
  );
};
```

### Estratégia de Deploy

**Fases de Implementação:**
1. **Fase 1:** Criar sistema de configuração centralizada
2. **Fase 2:** Arquivos de configuração e metadados
3. **Fase 3:** Documentação e arquivos estáticos
4. **Fase 4:** Migrar componentes para usar configuração centralizada
5. **Fase 5:** Banco de dados e migrações
6. **Fase 6:** Testes finais e validação

**Critérios de Sucesso:**
- Sistema de configuração centralizada funcionando
- Zero ocorrências de "Oliver" hardcoded em componentes
- Todas as funcionalidades mantidas
- PWA instalável com nome correto
- Metadados de compartilhamento corretos
- Facilidade para futuras mudanças de marca