# SQL de Exemplo para Criação de Licenças

## Como usar o Editor SQL do Supabase

1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Cole um dos exemplos abaixo
5. Clique em **Run** para executar

---

## 📋 **1. Criar uma Licença Simples (365 dias)**

```sql
-- Inserir uma nova licença válida por 365 dias
INSERT INTO public.licenses (code, expires_at, is_active)
VALUES (
  '3443331234567',  -- Substitua por seu código personalizado
  NOW() + INTERVAL '365 days',
  false
);
```

---

## 📋 **2. Criar Múltiplas Licenças (Exemplo: 5 licenças)**

```sql
-- Criar 5 licenças com códigos sequenciais
INSERT INTO public.licenses (code, expires_at, is_active)
VALUES 
  ('3443331000001', NOW() + INTERVAL '365 days', false),
  ('3443331000002', NOW() + INTERVAL '365 days', false),
  ('3443331000003', NOW() + INTERVAL '365 days', false),
  ('3443331000004', NOW() + INTERVAL '365 days', false),
  ('3443331000005', NOW() + INTERVAL '365 days', false);
```

---

## 🔧 **3. Usar a Função de Criação Automática (Recomendado)**

```sql
-- Criar 10 licenças automaticamente com códigos únicos
-- (Validade: 365 dias)
SELECT public.admin_create_bulk_licenses(10, 365);
```

**Resultado:** Retorna JSON com todos os códigos criados
```json
{
  "success": true,
  "codes": ["3443331234567", "3443331234568", ...],
  "quantity": 10,
  "expires_in_days": 365
}
```

---

## 📋 **4. Criar Licenças com Diferentes Validades**

```sql
-- Licenças com validades variadas
INSERT INTO public.licenses (code, expires_at, is_active)
VALUES 
  -- Licença de teste (7 dias)
  ('3443330000001', NOW() + INTERVAL '7 days', false),
  
  -- Licença mensal (30 dias)
  ('3443330000002', NOW() + INTERVAL '30 days', false),
  
  -- Licença anual (365 dias)
  ('3443330000003', NOW() + INTERVAL '365 days', false),
  
  -- Licença permanente (10 anos)
  ('3443330000004', NOW() + INTERVAL '10 years', false);
```

---

## 🔍 **5. Verificar Licenças Criadas**

```sql
-- Ver todas as licenças criadas recentemente
SELECT 
  code,
  expires_at,
  is_active,
  user_id,
  created_at
FROM public.licenses
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔍 **6. Verificar Status das Licenças**

```sql
-- Relatório completo de licenças
SELECT 
  COUNT(*) as total_licencas,
  COUNT(*) FILTER (WHERE is_active = true) as ativas,
  COUNT(*) FILTER (WHERE is_active = false) as inativas,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expiradas
FROM public.licenses;
```

---

## ⚙️ **7. Ativar Licença Manualmente para um Usuário**

```sql
-- Ativar licença específica para um usuário
-- SUBSTITUA os valores pelos corretos:
-- - '3443331234567': código da licença
-- - 'f54f66de-eafe-4411-b0c2-c20fa0b6201a': ID do usuário

SELECT public.activate_license_enhanced(
  '3443331234567',  -- Código da licença
  'f54f66de-eafe-4411-b0c2-c20fa0b6201a'  -- ID do usuário (uuid)
);
```

**Como encontrar o ID do usuário:**
```sql
-- Listar usuários para encontrar o ID
SELECT 
  up.id,
  up.name,
  au.email
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.name;
```

---

## 🔄 **8. Renovar Licença Existente**

```sql
-- Renovar licença por mais 30 dias
-- SUBSTITUA 'LICENSE_ID' pelo ID real da licença
SELECT public.admin_renew_license(
  'LICENSE_ID',  -- ID da licença (uuid)
  30  -- Dias adicionais
);
```

---

## 📊 **9. Estatísticas de Licenças (Admin)**

```sql
-- Ver estatísticas completas do sistema
SELECT public.admin_get_license_stats();
```

---

## ⚠️ **Dicas Importantes:**

### 🎯 **Formato do Código:**
- **SEMPRE** comece com `344333`
- Complete com **7 dígitos** adicionais
- Total: **13 dígitos**
- Exemplo: `3443331234567`

### 🔒 **Segurança:**
- Códigos devem ser **únicos**
- Use números aleatórios para os 7 últimos dígitos
- Evite sequências óbvias (123456, 111111, etc.)

### ⏰ **Validade:**
- Use `INTERVAL` para definir validade
- Exemplos:
  - `'7 days'` = 7 dias
  - `'30 days'` = 30 dias
  - `'365 days'` = 1 ano
  - `'10 years'` = 10 anos

### 🔄 **Status:**
- `is_active = false`: Licença disponível para ativação
- `is_active = true`: Licença já ativada por um usuário
- **Nunca** crie licenças com `is_active = true` diretamente

---

## 🚀 **Exemplo Prático Completo:**

```sql
-- 1. Criar 5 licenças para venda
SELECT public.admin_create_bulk_licenses(5, 365);

-- 2. Verificar se foram criadas
SELECT code, expires_at, is_active 
FROM public.licenses 
WHERE created_at >= NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC;

-- 3. Ver estatísticas atualizadas
SELECT public.admin_get_license_stats();
```

Esse workflow garante que você tenha controle total sobre a criação e gestão das licenças!