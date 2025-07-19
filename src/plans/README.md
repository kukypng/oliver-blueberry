# 📄 PÁGINA DE PLANOS - GUIA DE EDIÇÃO

Esta pasta contém todos os arquivos da página de planos, organizados de forma simples para facilitar edições futuras.

## 🎯 COMO EDITAR A PÁGINA

### Para editar TEXTOS e DADOS:
**Arquivo principal:** `src/plans/data/content.ts`

Este arquivo contém TODOS os textos e dados da página. Basta alterar os valores para mudar o conteúdo.

### Principais seções editáveis:

#### 1. **SEÇÃO PRINCIPAL**
- `titulo_principal`: Título da página
- `subtitulo_principal`: Subtítulo da página
- `logo`: Caminho para o logo

#### 2. **DADOS DO PLANO**
- `nome`: Nome do plano
- `preco`: Valor do plano (apenas número)
- `moeda`: Símbolo da moeda (R$, US$, etc)
- `periodo`: Período de cobrança (/mês, /ano, etc)
- `beneficios`: Lista dos benefícios do plano

#### 3. **SEÇÕES OPCIONAIS**
Cada seção tem um campo `mostrar_secao` que pode ser `true` ou `false`:
- **Vantagens**: `PLANS_CONTENT.vantagens.mostrar_secao`
- **Depoimentos**: `PLANS_CONTENT.depoimentos.mostrar_secao`  
- **FAQ**: `PLANS_CONTENT.perguntas_frequentes.mostrar_secao`

#### 4. **CONFIGURAÇÕES TÉCNICAS**
- `whatsapp_numero`: Número do WhatsApp para suporte
- `url_pagamento`: Link do MercadoPago para pagamento

## 📁 ESTRUTURA DA PASTA

```
src/plans/
├── README.md                    # Este arquivo de instruções
├── PlansPage.tsx               # Página principal (não mexer)
├── index.ts                    # Exportações (não mexer)
├── data/
│   └── content.ts              # ⭐ ARQUIVO PARA EDITAR TEXTOS
└── components/                 # Componentes da página (não mexer)
    ├── PlansHero.tsx
    ├── BenefitsSection.tsx
    ├── PlanCard.tsx
    ├── TestimonialsSection.tsx
    ├── FAQSection.tsx
    └── FinalCTA.tsx
```

## ⚠️ IMPORTANTE

- **SEMPRE EDITE:** Apenas o arquivo `data/content.ts`
- **NUNCA MEXA:** Nos outros arquivos, a menos que seja um desenvolvedor
- **ÍCONES DISPONÍVEIS:** Para a seção de vantagens, use apenas: "Zap", "Shield", "Users", "Award"
- **BACKUP:** Sempre faça uma cópia do arquivo antes de editar

## 🔧 EXEMPLOS DE EDIÇÃO

### Alterar o preço:
```javascript
plano: {
  preco: 59,  // Mude para o valor desejado
  moeda: "R$",
  periodo: "/mês"
}
```

### Adicionar uma vantagem:
```javascript
vantagens: {
  lista: [
    {
      icone: "Zap" as const,
      titulo: "Nova Vantagem",
      descricao: "Descrição da nova vantagem"
    }
    // ... outras vantagens
  ]
}
```

### Ocultar uma seção:
```javascript
depoimentos: {
  mostrar_secao: false,  // Mude para false para ocultar
  // ... resto da configuração
}
```

## 🆘 PRECISA DE AJUDA?

Se tiver dúvidas ou problemas:
1. Verifique se não quebrou a sintaxe do arquivo
2. Certifique-se de que todas as vírgulas e aspas estão corretas
3. Em caso de erro, restaure o backup do arquivo original