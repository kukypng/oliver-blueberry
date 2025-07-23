
import { normalizeDataString } from './normalizer';
import { HeaderMapper } from './standardHeaders';

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
 * 🚀 GERADOR DE CSV PADRONIZADO
 * Usa cabeçalhos idênticos aos esperados na importação
 * 
 * @param budgets - A lista de orçamentos a ser exportada.
 * @returns O conteúdo do arquivo CSV como uma string.
 */
export const generateExportCsv = (budgets: any[]): string => {
  const headerMapper = new HeaderMapper();
  
  // 📋 CABEÇALHOS PADRONIZADOS - idênticos aos da importação
  const headers = headerMapper.getExportHeaders();

  console.log('=== EXPORTAÇÃO PADRONIZADA ===');
  console.log('Cabeçalhos de exportação:', headers);
  console.log('Total de orçamentos:', budgets.length);

  // 🔄 PROCESSA TODOS OS ORÇAMENTOS - sem filtros
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

    // 💰 VALORES FINANCEIROS - conversão correta de centavos para reais
    const totalPrice = (Number(b.total_price) / 100).toFixed(2);
    const installmentPrice = b.installment_price ? (Number(b.installment_price) / 100).toFixed(2) : '';

    // 📊 MAPEAMENTO PADRONIZADO - ordem exata dos cabeçalhos
    return [
      b.device_type || '',                              // Tipo Aparelho
      b.device_model || '',                             // Modelo Aparelho  
      b.part_quality || b.issue || '',                 // Qualidade
      totalPrice,                                       // Preco Total
      installmentPrice,                                 // Preco Parcelado
      b.installments || '1',                           // Parcelas
      b.payment_condition || 'A Vista',                // Metodo Pagamento
      b.warranty_months || '3',                        // Garantia (meses)
      validityDays || '15',                            // Validade (dias)
      b.includes_delivery ? 'sim' : 'nao',             // Inclui Entrega
      b.includes_screen_protector ? 'sim' : 'nao',     // Inclui Pelicula
    ];
  });

  // 🔧 MONTAGEM FINAL DO CSV
  const csvRows = [
    headers.join(';'),
    ...formattedData.map(row => row.map(formatCsvField).join(';'))
  ];
  
  const csvContent = csvRows.join('\n');
  console.log('CSV gerado com', csvRows.length - 1, 'linhas de dados');
  
  return '\uFEFF' + csvContent; // BOM para encoding correto
};
