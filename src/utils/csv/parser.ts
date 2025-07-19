
import { normalizeHeader } from './normalizer';

type BudgetInsert = any; // Manter tipo para consistencia

/**
 * Analisa o texto de um arquivo CSV, valida e prepara os dados para inserção no banco.
 * @param csvText - O conteúdo do arquivo CSV como string.
 * @param userId - O ID do usuário logado.
 * @returns Uma lista de objetos de orçamento prontos para serem inseridos.
 */
export const parseAndPrepareBudgets = (csvText: string, userId: string): BudgetInsert[] => {
  const allLines = csvText.split(/\r\n|\n/);
  
  // Debug: Log das primeiras linhas para diagnóstico
  console.log('=== DEBUG CSV PARSER ===');
  console.log('Total de linhas:', allLines.length);
  console.log('Primeiras 10 linhas:');
  allLines.slice(0, 10).forEach((line, index) => {
    console.log(`Linha ${index}:`, JSON.stringify(line));
  });
  
  // Encontra a linha do cabeçalho com busca mais flexível
  let headerRowIndex = -1;
  
  // Primeira tentativa: busca exata
  headerRowIndex = allLines.findIndex(line => 
    line.includes('Tipo Aparelho') && line.includes('Modelo Aparelho') && line.includes('Preco Total')
  );
  
  // Segunda tentativa: busca mais flexível (sem acentos, case insensitive)
  if (headerRowIndex === -1) {
    headerRowIndex = allLines.findIndex(line => {
      const normalizedLine = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedLine.includes('tipo aparelho') && 
             normalizedLine.includes('modelo aparelho') && 
             normalizedLine.includes('preco total');
    });
  }
  
  // Terceira tentativa: busca por qualquer combinação dos campos principais
  if (headerRowIndex === -1) {
    headerRowIndex = allLines.findIndex(line => {
      const hasTypeField = line.includes('Tipo') || line.includes('tipo') || line.includes('Aparelho');
      const hasModelField = line.includes('Modelo') || line.includes('modelo');
      const hasPriceField = line.includes('Preco') || line.includes('preco') || line.includes('Total') || line.includes('total');
      return hasTypeField && hasModelField && hasPriceField;
    });
  }

  console.log('Índice do cabeçalho encontrado:', headerRowIndex);
  if (headerRowIndex >= 0) {
    console.log('Linha do cabeçalho:', JSON.stringify(allLines[headerRowIndex]));
  }

  if (headerRowIndex === -1) {
    // Mostrar todas as linhas para debug
    console.log('=== TODAS AS LINHAS DO ARQUIVO ===');
    allLines.forEach((line, index) => {
      console.log(`${index}: ${JSON.stringify(line)}`);
    });
    
    throw new Error(`Não foi possível encontrar o cabeçalho no arquivo CSV. 
    
Verifique se o arquivo contém uma linha com os campos:
- 'Tipo Aparelho'
- 'Modelo Aparelho' 
- 'Preco Total'

Arquivo analisado tem ${allLines.length} linhas. Verifique o console para mais detalhes.`);
  }

  // Considera apenas as linhas a partir do cabeçalho, ignorando linhas em branco
  const lines = allLines.slice(headerRowIndex).filter(line => line.trim() !== '');
  if (lines.length < 2) {
      throw new Error("Arquivo CSV inválido. Verifique se contém dados além do cabeçalho.");
  }

  const rawHeaders = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  const dataRows = lines.slice(1);

  const newBudgets = dataRows.map((line, rowIndex) => {
    // A checagem específica para a linha de exemplo foi removida para permitir reimportação de qualquer dado válido.
    if (line.trim() === '') return null;

    const values = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    
    const rowObject: { [key: string]: string } = {};
    normalizedHeaders.forEach((header, i) => {
      rowObject[header] = values[i] || '';
    });

    const priceString = String(rowObject['preco_total'] || '0').replace(',', '.');
    const price = parseFloat(priceString);

    if (isNaN(price) || price <= 0) {
      throw new Error(`Preço total inválido ou zerado na linha ${headerRowIndex + rowIndex + 2}. O preço deve ser um número maior que zero.`);
    }

    if (!rowObject['tipo_aparelho'] || !rowObject['modelo_aparelho'] || !rowObject['qualidade'] || !rowObject['servico_realizado']) {
      throw new Error(`Dados obrigatórios faltando na linha ${headerRowIndex + rowIndex + 2}. Verifique 'Tipo Aparelho', 'Modelo Aparelho', 'Qualidade' e 'Servico Realizado'.`);
    }

    const installmentPriceString = String(rowObject['preco_parcelado'] || '0').replace(',', '.');
    const installmentPrice = parseFloat(installmentPriceString);

    const installments = Number(rowObject['parcelas'] || 1);
    const validityDays = Number(rowObject['validade_dias'] || 15);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const paymentCondition = rowObject['metodo_pagamento'] || rowObject['condicao_pagamento'] || ((installments > 1 && installmentPrice > 0) ? 'Cartao de Credito' : 'A Vista');
    
    return {
      owner_id: userId,
      device_type: rowObject['tipo_aparelho'],
      device_model: rowObject['modelo_aparelho'],
      issue: rowObject['qualidade'] || rowObject['defeito_ou_problema'] || '',
      part_quality: rowObject['qualidade'] || rowObject['defeito_ou_problema'] || '',
      part_type: rowObject['servico_realizado'],
      notes: rowObject['observacoes'] || '',
      total_price: Math.round(price * 100),
      status: 'pending',
      cash_price: Math.round(price * 100),
      installment_price: isNaN(installmentPrice) || installmentPrice <= 0 ? null : Math.round(installmentPrice * 100),
      installments: isNaN(installments) || installments <= 1 ? 1 : installments,
      payment_condition: paymentCondition,
      warranty_months: Number(rowObject['garantia_meses'] || 3),
      includes_delivery: String(rowObject['inclui_entrega']).toLowerCase() === 'sim',
      includes_screen_protector: String(rowObject['inclui_pelicula']).toLowerCase() === 'sim',
      valid_until: validUntil.toISOString(),
      client_name: null,
      client_phone: null,
    };
  }).filter(Boolean);

  if (newBudgets.length === 0) {
    throw new Error("Nenhum orçamento válido encontrado no arquivo. Verifique se os dados foram preenchidos corretamente.");
  }
  
  return newBudgets as BudgetInsert[];
};
