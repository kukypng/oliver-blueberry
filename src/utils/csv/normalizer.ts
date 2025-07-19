
/**
 * Normaliza um texto removendo acentos, convertendo para minúsculas e
 * substituindo caracteres não alfanuméricos por underscores.
 * Ideal para criar chaves seguras a partir de cabeçalhos.
 * Ex: "Preço Total (*)" -> "preco_total"
 */
export const normalizeHeader = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s?\(\*\)/g, '') // Remove o " (*)" dos cabeçalhos obrigatórios
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '_') // Substituir não alfanuméricos por _
    .replace(/^_|_$/g, ''); // Remover underscores do início/fim
};

/**
 * Normaliza uma string de dados para exibição ou comparação, removendo acentos.
 * Ex: "Não" -> "Nao"
 */
export const normalizeDataString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};
