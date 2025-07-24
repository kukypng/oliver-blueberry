
# 📁 Pasta de Configuração - Oliver

Esta pasta contém todas as configurações importantes do aplicativo Oliver, organizadas em arquivos específicos para facilitar a edição e manutenção.

## 📄 Arquivos de Configuração

### `app.ts` - Configurações Gerais
- Nome do aplicativo e versão
- URLs de redirecionamento de autenticação
- Configurações de licença
- Branding e visual

### `contacts.ts` - Informações de Contato
- **WhatsApp**: Número e mensagens padrão
- **Email**: Endereços de suporte e contato
- **Endereço**: Localização da empresa
- **Redes Sociais**: Links para expansão futura

### `payment.ts` - Configurações de Pagamento
- Links do MercadoPago
- Configurações de planos e preços
- Configurações de moeda

### `messages.ts` - Textos do Sistema
- Mensagens de erro e sucesso
- Textos da interface
- Textos de marketing

### `features.ts` - Funcionalidades
- Ativar/desativar recursos
- Configurações de performance
- Limites de dados

### `urls.ts` - URLs e Redirecionamentos
- URLs de redirecionamento interno
- Links externos
- Configurações de API

## 🔧 Como Usar

### Exemplo 1: Alterar WhatsApp
```typescript
// Em contacts.ts, altere:
whatsapp: {
  number: '556496028022', // ← Seu novo número
  supportMessage: 'Sua nova mensagem aqui'
}
```

### Exemplo 2: Alterar Nome do App
```typescript
// Em app.ts, altere:
name: 'Oliver', // ← Novo nome
fullName: 'Oliver - Sistema de Gestão' // ← Nome completo
```

### Exemplo 3: Alterar Preço do Plano
```typescript
// Em payment.ts, altere:
plans: {
  professional: {
    price: 45, // ← Novo preço
    currency: 'R$'
  }
}
```

## ⚡ Helpers Úteis

O arquivo `index.ts` exporta helpers para uso fácil:

- `getWhatsAppUrl(message)` - Gera URL do WhatsApp
- `getPaymentUrl()` - Retorna URL de pagamento
- `getLicenseValidation()` - Validação de licença

## 🚨 Importante

Após alterar qualquer configuração, reinicie o servidor de desenvolvimento para que as mudanças tenham efeito.
