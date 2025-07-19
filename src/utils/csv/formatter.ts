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
 * Usa cabeçalhos limpos e pode ser re-importado.
 * @param budgets - A lista de orçamentos a ser exportada.
 * @returns O conteúdo do arquivo CSV como uma string.
 */
export const generateExportCsv = (budgets: any[]): string => {
  // Cabeçalhos para exportação devem ser limpos e consistentes para re-importação.
  const headers = [
    'Tipo Aparelho', 'Aparelho/Serviço', 'Qualidade',
    'Observacoes', 'Preco Total', 'Preco Parcelado', 'Parcelas',
    'Metodo de Pagamento', 'Garantia (meses)', 'Validade (dias)', 'Inclui Entrega',
    'Inclui Pelicula'
  ];

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
      b.device_type,
      b.device_model,
      b.part_quality || b.issue || '',
      b.notes || '',
      totalPrice,
      installmentPrice,
      b.installments,
      b.payment_condition,
      b.warranty_months,
      validityDays,
      b.includes_delivery ? 'sim' : 'nao',
      b.includes_screen_protector ? 'sim' : 'nao',
    ];
  });

  const csvRows = [
    headers.join(';'),
    ...formattedData.map(row => row.map(formatCsvField).join(';'))
  ];
  
  const csvContent = csvRows.join('\n');
  return '\uFEFF' + csvContent; // Adiciona BOM
};
