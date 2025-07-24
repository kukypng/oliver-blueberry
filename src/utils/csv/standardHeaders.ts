
/**
 * ✅ CABEÇALHOS PADRONIZADOS - Sistema unificado
 * 
 * Este arquivo define os cabeçalhos únicos que devem ser usados tanto na exportação
 * quanto na importação, garantindo compatibilidade total entre os processos.
 */

export interface StandardHeader {
  /** Nome do cabeçalho no CSV (exatamente como aparece no arquivo) */
  csvHeader: string;
  /** Nome do campo normalizado usado internamente */
  fieldName: string;
  /** Se o campo é obrigatório */
  required: boolean;
  /** Tipo do campo */
  type: 'string' | 'number' | 'boolean' | 'date';
  /** Valor padrão se vazio */
  defaultValue?: any;
  /** Variações aceitas do cabeçalho (para compatibilidade) */
  aliases?: string[];
}

/**
 * 🔄 MAPEAMENTO PADRONIZADO DE CABEÇALHOS
 * Ordem e nomes IDÊNTICOS entre exportação e importação
 */
export const STANDARD_HEADERS: StandardHeader[] = [
  {
    csvHeader: 'Tipo Aparelho',
    fieldName: 'tipo_aparelho',
    required: true,
    type: 'string',
    aliases: ['Tipo do Aparelho', 'Device Type']
  },
  {
    csvHeader: 'Modelo Aparelho',
    fieldName: 'modelo_aparelho',
    required: true,
    type: 'string',
    aliases: ['Modelo do Aparelho', 'Device Model']
  },
  {
    csvHeader: 'Qualidade',
    fieldName: 'qualidade',
    required: true,
    type: 'string',
    aliases: ['Defeito ou Problema', 'Issue', 'Problem']
  },
  {
    csvHeader: 'Preco Total',
    fieldName: 'preco_total',
    required: true,
    type: 'number',
    aliases: ['Preço Total', 'Total Price', 'Price']
  },
  {
    csvHeader: 'Preco Parcelado',
    fieldName: 'preco_parcelado',
    required: false,
    type: 'number',
    defaultValue: null,
    aliases: ['Preço Parcelado', 'Installment Price']
  },
  {
    csvHeader: 'Parcelas',
    fieldName: 'parcelas',
    required: false,
    type: 'number',
    defaultValue: 1,
    aliases: ['Installments']
  },
  {
    csvHeader: 'Metodo Pagamento',
    fieldName: 'metodo_pagamento',
    required: false,
    type: 'string',
    defaultValue: 'A Vista',
    aliases: ['Método de Pagamento', 'Payment Method', 'Condição de Pagamento', 'Payment Condition']
  },
  {
    csvHeader: 'Garantia (meses)',
    fieldName: 'garantia_meses',
    required: false,
    type: 'number',
    defaultValue: 3,
    aliases: ['Garantia', 'Warranty', 'Warranty Months']
  },
  {
    csvHeader: 'Validade (dias)',
    fieldName: 'validade_dias',
    required: false,
    type: 'number',
    defaultValue: 15,
    aliases: ['Validade', 'Validity', 'Valid Days']
  },
  {
    csvHeader: 'Inclui Entrega',
    fieldName: 'inclui_entrega',
    required: false,
    type: 'boolean',
    defaultValue: false,
    aliases: ['Includes Delivery', 'Delivery']
  },
  {
    csvHeader: 'Inclui Pelicula',
    fieldName: 'inclui_pelicula',
    required: false,
    type: 'boolean',
    defaultValue: false,
    aliases: ['Inclui Película', 'Includes Screen Protector', 'Screen Protector']
  }
];

/**
 * 🔍 MAPEADOR INTELIGENTE DE CABEÇALHOS
 * Encontra o cabeçalho padrão correspondente a partir de qualquer variação
 */
export class HeaderMapper {
  private normalizedMap: Map<string, StandardHeader> = new Map();

  constructor() {
    this.buildNormalizedMap();
  }

  private buildNormalizedMap(): void {
    STANDARD_HEADERS.forEach(header => {
      // Adicionar o cabeçalho principal
      const normalizedMain = this.normalizeHeader(header.csvHeader);
      this.normalizedMap.set(normalizedMain, header);

      // Adicionar aliases
      if (header.aliases) {
        header.aliases.forEach(alias => {
          const normalizedAlias = this.normalizeHeader(alias);
          this.normalizedMap.set(normalizedAlias, header);
        });
      }
    });
  }

  private normalizeHeader(text: string): string {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '_') // Substitui não alfanuméricos por _
      .replace(/^_|_$/g, ''); // Remove underscores do início/fim
  }

  /**
   * Encontra o cabeçalho padrão correspondente a um cabeçalho do CSV
   */
  findStandardHeader(csvHeader: string): StandardHeader | null {
    const normalized = this.normalizeHeader(csvHeader);
    return this.normalizedMap.get(normalized) || null;
  }

  /**
   * Mapeia uma linha de cabeçalhos do CSV para os campos padrão
   */
  mapHeaders(csvHeaders: string[]): { [csvIndex: number]: StandardHeader } {
    const mapping: { [csvIndex: number]: StandardHeader } = {};
    
    csvHeaders.forEach((header, index) => {
      const standardHeader = this.findStandardHeader(header);
      if (standardHeader) {
        mapping[index] = standardHeader;
      }
    });

    return mapping;
  }

  /**
   * Gera os cabeçalhos padronizados para exportação
   */
  getExportHeaders(): string[] {
    return STANDARD_HEADERS.map(h => h.csvHeader);
  }

  /**
   * Retorna todos os cabeçalhos padrão
   */
  getStandardHeaders(): StandardHeader[] {
    return STANDARD_HEADERS;
  }
}
