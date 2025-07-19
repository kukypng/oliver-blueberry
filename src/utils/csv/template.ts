
/**
 * Gera o conteúdo CSV para o modelo de importação com um layout amigável, semelhante a uma planilha.
 * @returns O conteúdo do arquivo de modelo CSV como uma string.
 */
export const generateTemplateCsv = (): string => {
  const instructions = [
    'MODELO DE IMPORTACAO DE ORCAMENTOS',
    '==================================',
    '',
    'INSTRUCOES:',
    '1. Preencha uma linha para cada orcamento, seguindo as colunas definidas abaixo.',
    '2. NAO altere os nomes das colunas.',
    '3. Campos como "Tipo Aparelho", "Modelo Aparelho", "Qualidade", "Servico Realizado" e "Preco Total" são obrigatórios.',
    '4. Para precos, use virgula ou ponto como separador decimal (ex: 150.00 ou 150,00).',
    '5. Para colunas de sim/nao, digite exatamente "sim" ou "nao".',
    '6. A linha de exemplo abaixo deve ser substituida pelos seus dados.',
    ''
  ];

  // Cabeçalhos IDÊNTICOS ao formato de exportação para garantir compatibilidade total.
  const headers = [
    'Tipo Aparelho', 'Modelo Aparelho', 'Qualidade',
    'Servico Realizado', 'Observacoes', 'Preco Total', 'Preco Parcelado', 'Parcelas',
    'Metodo de Pagamento', 'Garantia (meses)', 'Validade (dias)', 'Inclui Entrega',
    'Inclui Pelicula'
  ];
  
  // Linha de exemplo para guiar o usuário (usando ponto decimal)
  const exampleRow = [
    'Smartphone', 'Galaxy A12', 'Original',
    'Troca de Frontal Completa', 'Aparelho com marcas de uso na tampa', '350.00', '400.00', '2',
    'Cartao de Credito', '3', '10', 'nao', 'sim'
  ];

  const csvContent = [
    instructions.join('\n'),
    headers.join(';'),
    exampleRow.join(';')
  ].join('\n');

  return '\uFEFF' + csvContent; // BOM para garantir encoding correto no Excel
};
