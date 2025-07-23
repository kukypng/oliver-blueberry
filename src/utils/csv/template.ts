
import { HeaderMapper } from './standardHeaders';

/**
 * 📄 GERADOR DE TEMPLATE PADRONIZADO
 * Usa cabeçalhos IDÊNTICOS à exportação para garantia de compatibilidade total
 * 
 * @returns O conteúdo do arquivo de modelo CSV como uma string.
 */
export const generateTemplateCsv = (): string => {
  const headerMapper = new HeaderMapper();
  
  const instructions = [
    'MODELO DE IMPORTACAO DE ORCAMENTOS - COMPATIBILIDADE TOTAL',
    '=========================================================',
    '',
    'INSTRUCOES:',
    '1. Este modelo usa EXATAMENTE os mesmos cabeçalhos da exportação.',
    '2. Arquivos exportados pelo sistema podem ser editados e reimportados sem avisos.',
    '3. NAO altere os nomes das colunas - elas são padronizadas.',
    '4. Campos obrigatórios: Tipo Aparelho, Modelo Aparelho, Qualidade, Preco Total.',
    '5. Para preços, use ponto ou vírgula como decimal (ex: 150.00 ou 150,00).',
    '6. Para sim/não, digite "sim" ou "nao" (sem acentos).',
    '7. A linha de exemplo deve ser substituída pelos seus dados.',
    ''
  ];

  // 📋 CABEÇALHOS PADRONIZADOS - idênticos à exportação
  const headers = headerMapper.getExportHeaders();
  
  console.log('=== TEMPLATE PADRONIZADO ===');
  console.log('Cabeçalhos do template:', headers);
  
  // 📝 LINHA DE EXEMPLO COMPATÍVEL
  const exampleRow = [
    'Smartphone',                                    // Tipo Aparelho
    'Galaxy A12',                                   // Modelo Aparelho
    'Original',                                     // Qualidade
    '350.00',                                       // Preco Total
    '400.00',                                       // Preco Parcelado
    '2',                                            // Parcelas
    'Cartao de Credito',                           // Metodo Pagamento
    '3',                                            // Garantia (meses)
    '10',                                           // Validade (dias)
    'nao',                                          // Inclui Entrega
    'sim'                                           // Inclui Pelicula
  ];

  const csvContent = [
    instructions.join('\n'),
    headers.join(';'),
    exampleRow.join(';')
  ].join('\n');

  return '\uFEFF' + csvContent; // BOM para encoding correto
};
