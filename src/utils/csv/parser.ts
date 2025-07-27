import { CsvBudgetData, CsvError, CsvImportResult } from '@/types/csv';
import { CsvNumberUtils } from './numberUtils';

export class CsvParser {
  private static readonly REQUIRED_HEADERS = [
    'Tipo Aparelho',
    'Serviço/Aparelho', 
    'Preço à vista',
    'Preço Parcelado',
    'Parcelas',
    'Método de Pagamento',
    'Garantia (meses)',
    'Validade (dias)',
    'Inclui Entrega',
    'Inclui Película'
  ];

  private static readonly OPTIONAL_HEADERS = [
    'Qualidade',
    'Observações'
  ];

  static parse(csvContent: string): CsvImportResult {
    const errors: CsvError[] = [];
    const data: CsvBudgetData[] = [];
    
    try {
      const lines = csvContent.trim().split('\n');
      
      if (lines.length === 0) {
        return {
          success: false,
          data: [],
          errors: [{ row: 0, field: 'file', message: 'Arquivo vazio', value: '' }],
          totalRows: 0,
          validRows: 0
        };
      }

      // Parse header
      const headerLine = lines[0];
      const headers = this.parseRow(headerLine);
      
      // Validate headers
      const headerErrors = this.validateHeaders(headers);
      if (headerErrors.length > 0) {
        return {
          success: false,
          data: [],
          errors: headerErrors,
          totalRows: lines.length - 1,
          validRows: 0
        };
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const rowData = this.parseRow(line);
        const rowErrors: CsvError[] = [];
        
        try {
          const budgetData = this.parseRowData(rowData, headers, i + 1, rowErrors);
          if (rowErrors.length === 0) {
            data.push(budgetData);
          }
        } catch (error) {
          rowErrors.push({
            row: i + 1,
            field: 'row',
            message: `Erro ao processar linha: ${error}`,
            value: line
          });
        }

        errors.push(...rowErrors);
      }

      return {
        success: errors.length === 0,
        data,
        errors,
        totalRows: lines.length - 1,
        validRows: data.length
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, field: 'file', message: `Erro ao processar arquivo: ${error}`, value: '' }],
        totalRows: 0,
        validRows: 0
      };
    }
  }

  private static parseRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static validateHeaders(headers: string[]): CsvError[] {
    const errors: CsvError[] = [];
    
    for (const required of this.REQUIRED_HEADERS) {
      if (!headers.includes(required)) {
        errors.push({
          row: 1,
          field: 'header',
          message: `Cabeçalho obrigatório ausente: ${required}`,
          value: headers.join(';')
        });
      }
    }

    return errors;
  }

  private static parseRowData(
    rowData: string[], 
    headers: string[], 
    rowNumber: number,
    errors: CsvError[]
  ): CsvBudgetData {
    const getValue = (header: string): string => {
      const index = headers.indexOf(header);
      return index >= 0 ? (rowData[index] || '').trim() : '';
    };

    const getNumericValue = (header: string): number => {
      const value = getValue(header);
      if (!value) return 0;
      
      const parsed = CsvNumberUtils.parseNumber(value);
      
      if (isNaN(parsed)) {
        errors.push({
          row: rowNumber,
          field: header,
          message: `Valor numérico inválido: ${value}`,
          value
        });
        return 0;
      }
      
      return parsed;
    };

    const getBooleanValue = (header: string): boolean => {
      const value = getValue(header).toLowerCase();
      if (!['sim', 'não', 'nao', 'yes', 'no', 'true', 'false'].includes(value)) {
        errors.push({
          row: rowNumber,
          field: header,
          message: `Valor booleano inválido: ${value}. Use 'sim' ou 'não'`,
          value
        });
        return false;
      }
      return ['sim', 'yes', 'true'].includes(value);
    };

    const getIntegerValue = (header: string): number => {
      const value = getValue(header);
      if (!value) return 0;
      
      // Limpar o valor: remover espaços e caracteres não numéricos
      const cleanValue = value.trim().replace(/[^\d]/g, '');
      const parsed = parseInt(cleanValue);
      
      if (isNaN(parsed)) {
        errors.push({
          row: rowNumber,
          field: header,
          message: `Valor inteiro inválido: ${value}`,
          value
        });
        return 0;
      }
      
      return parsed;
    };

    // Validate required fields (excluding optional ones)
    for (const required of this.REQUIRED_HEADERS) {
      const value = getValue(required);
      if (!value) {
        errors.push({
          row: rowNumber,
          field: required,
          message: `Campo obrigatório vazio: ${required}`,
          value
        });
      }
    }

    // Optional fields should not generate errors if empty
    // Qualidade and Observações are truly optional

    return {
      tipo_aparelho: getValue('Tipo Aparelho'),
      servico_aparelho: getValue('Serviço/Aparelho'),
      qualidade: getValue('Qualidade') || undefined,
      observacoes: getValue('Observações') || undefined,
      preco_vista: getNumericValue('Preço à vista'),
      preco_parcelado: getNumericValue('Preço Parcelado'),
      parcelas: getIntegerValue('Parcelas'),
      metodo_pagamento: getValue('Método de Pagamento'),
      garantia_meses: getIntegerValue('Garantia (meses)'),
      validade_dias: getIntegerValue('Validade (dias)'),
      inclui_entrega: getBooleanValue('Inclui Entrega'),
      inclui_pelicula: getBooleanValue('Inclui Película')
    };
  }
}