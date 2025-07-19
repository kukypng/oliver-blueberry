
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
  
  // Encontra a linha do cabeçalho, que deve conter os campos principais
  const headerRowIndex = allLines.findIndex(line => 
    line.includes('Tipo Aparelho') && line.includes('Modelo Aparelho') && line.includes('Preco Total')
  );

  if (headerRowIndex === -1) {
    throw new Error("Não foi possível encontrar o cabeçalho no arquivo CSV. Verifique se o modelo está correto e contém as colunas necessárias.");
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
