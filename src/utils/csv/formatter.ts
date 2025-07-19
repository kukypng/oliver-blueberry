import { normalizeDataString } from './normalizer';

/**
 * Formata um valor para ser inserido em uma célula CSV, escapando caracteres especiais.
 */
const formatCsvField = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  let str = normalizeDataString(String(value));

  if (str.includes(';') || str.includes('\n') || str.includes('"')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};


/**
 * Gera o conteúdo CSV para exportação a partir de uma lista de orçamentos.
 * EXPORTA TODOS OS ORÇAMENTOS, mesmo com campos vazios ou zerados.
 * Usa cabeçalhos idênticos ao template de importação para garantir compatibilidade total.
 * @param budgets - A lista de orçamentos a ser exportada.
 * @returns O conteúdo do arquivo CSV como uma string.
 */
export const generateExportCsv = (budgets: any[]): string => {
  // Cabeçalhos IDÊNTICOS ao template de importação para garantir re-importação perfeita
  const headers = [
    'Tipo Aparelho', 'Modelo Aparelho', 'Qualidade',
    'Servico Realizado', 'Observacoes', 'Preco Total', 'Preco Parcelado', 'Parcelas',
    'Metodo de Pagamento', 'Garantia (meses)', 'Validade (dias)', 'Inclui Entrega',
    'Inclui Pelicula'
  ];

  // PROCESSA TODOS OS ORÇAMENTOS - não filtra nenhum registro
  const formattedData = budgets.map(b => {
    const validUntilDate = b.valid_until ? new Date(b.valid_until) : null;
    let validityDays = '';

    if (validUntilDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      validUntilDate.setHours(0, 0, 0, 0);
      const diffTime = validUntilDate.getTime() - today.getTime();
      validityDays = String(Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
    }

    // Os preços são exportados com ponto decimal para consistência.
    const totalPrice = (Number(b.total_price) / 100).toFixed(2);
    const installmentPrice = b.installment_price ? (Number(b.installment_price) / 100).toFixed(2) : '';

    return [
      b.device_type || '',                              // Tipo Aparelho - SEMPRE exporta, mesmo vazio
      b.device_model || '',                             // Modelo Aparelho - SEMPRE exporta, mesmo vazio
      b.part_quality || b.issue || '',                 // Qualidade - SEMPRE exporta, mesmo vazio
      b.part_type || b.device_info || '',              // Servico Realizado - SEMPRE exporta, mesmo vazio
      b.notes || '',                                    // Observacoes - SEMPRE exporta, mesmo vazio
      totalPrice,                                       // Preco Total - SEMPRE exporta (mínimo 0.00)
      installmentPrice,                                 // Preco Parcelado - SEMPRE exporta, mesmo vazio
      b.installments || '1',                           // Parcelas - SEMPRE exporta (padrão 1)
      b.payment_condition || 'A Vista',                // Metodo de Pagamento - SEMPRE exporta (padrão A Vista)
      b.warranty_months || '3',                        // Garantia (meses) - SEMPRE exporta (padrão 3)
      validityDays || '15',                            // Validade (dias) - SEMPRE exporta (padrão 15)
      b.includes_delivery ? 'sim' : 'nao',             // Inclui Entrega - SEMPRE exporta
      b.includes_screen_protector ? 'sim' : 'nao',     // Inclui Pelicula - SEMPRE exporta
    ];
  });

  const csvRows = [
    headers.join(';'),
    ...formattedData.map(row => row.map(formatCsvField).join(';'))
  ];
  
  const csvContent = csvRows.join('\n');
  return '\uFEFF' + csvContent; // Adiciona BOM
};
