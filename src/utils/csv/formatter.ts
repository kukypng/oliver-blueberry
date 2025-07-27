import { CsvBudgetData, CsvExportFilters } from '@/types/csv';

export class CsvFormatter {
  private static readonly HEADERS = [
    'Tipo Aparelho',
    'Serviço/Aparelho',
    'Qualidade',
    'Observações',
    'Preço à vista',
    'Preço Parcelado',
    'Parcelas',
    'Método de Pagamento',
    'Garantia (meses)',
    'Validade (dias)',
    'Inclui Entrega',
    'Inclui Película'
  ];

  static format(data: CsvBudgetData[], filters?: CsvExportFilters): string {
    const filteredData = filters ? this.applyFilters(data, filters) : data;
    
    if (filteredData.length === 0) {
      return this.HEADERS.join(';') + '\n'; // Return just headers if no data
    }
    
    const headerLine = this.HEADERS.join(';');
    const dataLines = filteredData.map(item => this.formatRow(item));
    
    return [headerLine, ...dataLines].join('\n');
  }

  private static formatRow(data: CsvBudgetData): string {
    const values = [
      this.escapeValue(data.tipo_aparelho),
      this.escapeValue(data.servico_aparelho),
      this.escapeValue(data.qualidade || ''),
      this.escapeValue(data.observacoes || ''),
      data.preco_vista.toString().replace('.', ','),
      data.preco_parcelado.toString().replace('.', ','),
      data.parcelas.toString(),
      this.escapeValue(data.metodo_pagamento),
      data.garantia_meses.toString(),
      data.validade_dias.toString(),
      data.inclui_entrega ? 'sim' : 'não',
      data.inclui_pelicula ? 'sim' : 'não'
    ];

    return values.join(';');
  }

  private static escapeValue(value: string): string {
    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private static applyFilters(data: CsvBudgetData[], filters: CsvExportFilters): CsvBudgetData[] {
    return data.filter(item => {
      // Filtro por tipo de aparelho
      if (filters.tipo_aparelho && filters.tipo_aparelho.length > 0) {
        if (!filters.tipo_aparelho.includes(item.tipo_aparelho)) {
          return false;
        }
      }

      // Filtro por garantia
      if (filters.garantia_min !== undefined && item.garantia_meses < filters.garantia_min) {
        return false;
      }
      if (filters.garantia_max !== undefined && item.garantia_meses > filters.garantia_max) {
        return false;
      }

      // Filtro por validade
      if (filters.validade_min !== undefined && item.validade_dias < filters.validade_min) {
        return false;
      }
      if (filters.validade_max !== undefined && item.validade_dias > filters.validade_max) {
        return false;
      }

      // Filtro por preço
      if (filters.preco_min !== undefined && item.preco_vista < filters.preco_min) {
        return false;
      }
      if (filters.preco_max !== undefined && item.preco_vista > filters.preco_max) {
        return false;
      }

      // Filtro por método de pagamento
      if (filters.metodo_pagamento && filters.metodo_pagamento.length > 0) {
        if (!filters.metodo_pagamento.includes(item.metodo_pagamento)) {
          return false;
        }
      }

      // Filtro por entrega
      if (filters.inclui_entrega !== undefined && item.inclui_entrega !== filters.inclui_entrega) {
        return false;
      }

      // Filtro por película
      if (filters.inclui_pelicula !== undefined && item.inclui_pelicula !== filters.inclui_pelicula) {
        return false;
      }

      return true;
    });
  }

  static generateTemplate(): string {
    const templateData: CsvBudgetData = {
      tipo_aparelho: 'celular',
      servico_aparelho: 'Tela iPhone 11',
      qualidade: 'Gold',
      observacoes: 'Com mensagem de peça não genuína',
      preco_vista: 750,
      preco_parcelado: 800,
      parcelas: 10,
      metodo_pagamento: 'Cartão de Crédito',
      garantia_meses: 6,
      validade_dias: 15,
      inclui_entrega: true,
      inclui_pelicula: true
    };

    return this.format([templateData]);
  }
}