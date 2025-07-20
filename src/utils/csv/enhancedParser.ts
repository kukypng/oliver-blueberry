import { normalizeHeader, normalizeDataString } from './normalizer';
import { 
  ValidationResult, 
  ParsedRow, 
  ImportSummary, 
  FieldMapping, 
  FIELD_MAPPINGS 
} from './validationTypes';

/**
 * Parser CSV aprimorado que aceita dados incompletos e fornece feedback detalhado
 */
export class EnhancedCsvParser {
  private fieldMappings: FieldMapping[];
  
  constructor(fieldMappings: FieldMapping[] = FIELD_MAPPINGS) {
    this.fieldMappings = fieldMappings;
  }

  /**
   * Valida um campo específico
   */
  private validateField(field: FieldMapping, value: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      data: value
    };

    // Verifica se o campo é obrigatório e está vazio
    if (field.required && (!value || value.toString().trim() === '')) {
      result.isValid = false;
      result.errors.push(`Campo obrigatório '${field.field}' está vazio`);
      return result;
    }

    // Se o campo está vazio e não é obrigatório, usa o valor padrão
    if ((!value || value.toString().trim() === '') && !field.required) {
      result.data = field.defaultValue;
      if (field.defaultValue !== null && field.defaultValue !== undefined && field.defaultValue !== '') {
        result.warnings.push(`Campo '${field.field}' estava vazio, usando valor padrão: ${field.defaultValue}`);
      }
      return result;
    }

    // Validação por tipo
    switch (field.type) {
      case 'number':
        const numValue = this.parseNumber(value);
        if (isNaN(numValue)) {
          result.isValid = false;
          result.errors.push(`Campo '${field.field}' deve ser um número válido`);
        } else {
          result.data = numValue;
          // Validação específica para preços
          if (field.field === 'preco_total' && numValue <= 0) {
            result.isValid = false;
            result.errors.push(`Preço total deve ser maior que zero`);
          }
        }
        break;

      case 'boolean':
        result.data = this.parseBoolean(value);
        break;

      case 'string':
        result.data = value.toString().trim();
        break;

      default:
        result.data = value;
    }

    return result;
  }

  /**
   * Converte valor para número, tratando vírgulas e pontos
   */
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    
    const stringValue = value.toString().trim();
    if (stringValue === '') return NaN;
    
    // Substituir vírgula por ponto para números decimais
    const normalizedValue = stringValue.replace(',', '.');
    return parseFloat(normalizedValue);
  }

  /**
   * Converte valor para boolean
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    
    const stringValue = value.toString().toLowerCase().trim();
    return stringValue === 'sim' || stringValue === 'true' || stringValue === '1';
  }

  /**
   * Processa uma linha de dados
   */
  private processRow(rowData: { [key: string]: string }, rowIndex: number): ParsedRow {
    const processedRow: ParsedRow = {
      rowIndex,
      data: {},
      errors: [],
      warnings: [],
      isValid: true
    };

    for (const fieldMapping of this.fieldMappings) {
      const value = rowData[fieldMapping.field];
      const validation = this.validateField(fieldMapping, value);
      
      processedRow.data[fieldMapping.field] = validation.data;
      processedRow.errors.push(...validation.errors);
      processedRow.warnings.push(...validation.warnings);
      
      if (!validation.isValid) {
        processedRow.isValid = false;
      }
    }

    return processedRow;
  }

  /**
   * Converte dados processados para formato do banco
   */
  private convertToDatabase(processedRow: ParsedRow, userId: string): any {
    const data = processedRow.data;
    
    // Calcular data de validade
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validade_dias || 15));

    // Determinar condição de pagamento
    const installments = data.parcelas || 1;
    const installmentPrice = data.preco_parcelado || 0;
    const paymentCondition = data.condicao_pagamento || 
      ((installments > 1 && installmentPrice > 0) ? 'Cartao de Credito' : 'A Vista');

    return {
      owner_id: userId,
      device_type: data.tipo_aparelho,
      
      device_model: data.modelo_aparelho,
      issue: data.defeito_ou_problema,
      part_type: data.servico_realizado,
      notes: data.observacoes || '',
      total_price: Math.round((data.preco_total || 0) * 100), // Converter para centavos
      status: 'pending',
      cash_price: Math.round((data.preco_total || 0) * 100),
      installment_price: data.preco_parcelado ? Math.round(data.preco_parcelado * 100) : null,
      installments: installments,
      payment_condition: paymentCondition,
      warranty_months: data.garantia_meses || 3,
      includes_delivery: data.inclui_entrega || false,
      includes_screen_protector: data.inclui_pelicula || false,
      valid_until: validUntil.toISOString(),
      client_name: null,
      client_phone: null,
      workflow_status: 'pending'
    };
  }

  /**
   * Analisa CSV e retorna dados processados com validação flexível
   */
  public parseAndValidate(csvText: string, userId: string): ImportSummary {
    const allLines = csvText.split(/\r\n|\n/);
    
    // Debug: Log das primeiras linhas para diagnóstico
    console.log('=== DEBUG ENHANCED CSV PARSER ===');
    console.log('Total de linhas:', allLines.length);
    console.log('Primeiras 10 linhas:');
    allLines.slice(0, 10).forEach((line, index) => {
      console.log(`Linha ${index}:`, JSON.stringify(line));
    });
    
    // Encontrar cabeçalho com busca mais flexível
    let headerRowIndex = -1;
    
    // Primeira tentativa: busca exata
    headerRowIndex = allLines.findIndex(line => 
      line.includes('Tipo Aparelho') && line.includes('Modelo Aparelho') && line.includes('Preco Total')
    );
    
    // Segunda tentativa: busca mais flexível (sem acentos, case insensitive)
    if (headerRowIndex === -1) {
      headerRowIndex = allLines.findIndex(line => {
        const normalizedLine = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedLine.includes('tipo aparelho') && 
               normalizedLine.includes('modelo aparelho') && 
               normalizedLine.includes('preco total');
      });
    }
    
    // Terceira tentativa: busca por qualquer combinação dos campos principais
    if (headerRowIndex === -1) {
      headerRowIndex = allLines.findIndex(line => {
        const hasTypeField = line.includes('Tipo') || line.includes('tipo') || line.includes('Aparelho');
        const hasModelField = line.includes('Modelo') || line.includes('modelo');
        const hasPriceField = line.includes('Preco') || line.includes('preco') || line.includes('Total') || line.includes('total');
        return hasTypeField && hasModelField && hasPriceField;
      });
    }

    console.log('Índice do cabeçalho encontrado:', headerRowIndex);
    if (headerRowIndex >= 0) {
      console.log('Linha do cabeçalho:', JSON.stringify(allLines[headerRowIndex]));
    }

    if (headerRowIndex === -1) {
      // Mostrar todas as linhas para debug
      console.log('=== TODAS AS LINHAS DO ARQUIVO (Enhanced Parser) ===');
      allLines.forEach((line, index) => {
        console.log(`${index}: ${JSON.stringify(line)}`);
      });
      
      throw new Error(`Não foi possível encontrar o cabeçalho no arquivo CSV. 
      
Verifique se o arquivo contém uma linha com os campos:
- 'Tipo Aparelho'
- 'Modelo Aparelho' 
- 'Preco Total'

Arquivo analisado tem ${allLines.length} linhas. Verifique o console para mais detalhes.`);
    }

    // Filtrar linhas vazias
    const lines = allLines.slice(headerRowIndex).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("Arquivo CSV deve conter pelo menos uma linha de dados além do cabeçalho.");
    }

    // Processar cabeçalho
    const rawHeaders = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    const normalizedHeaders = rawHeaders.map(normalizeHeader);

    // Processar linhas de dados
    const dataRows = lines.slice(1);
    const processedRows: ParsedRow[] = [];
    const validData: any[] = [];
    const allErrors: string[] = [];
    let totalWarnings = 0;

    dataRows.forEach((line, index) => {
      if (line.trim() === '') return; // Pular linhas vazias

      const values = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      
      // Criar objeto de dados da linha
      const rowData: { [key: string]: string } = {};
      normalizedHeaders.forEach((header, i) => {
        rowData[header] = values[i] || '';
      });

      // Processar linha
      const processedRow = this.processRow(rowData, index + 1);
      processedRows.push(processedRow);
      
      if (processedRow.isValid) {
        validData.push(this.convertToDatabase(processedRow, userId));
      } else {
        allErrors.push(...processedRow.errors.map(error => 
          `Linha ${index + 2}: ${error}`
        ));
      }

      totalWarnings += processedRow.warnings.length;
    });

    return {
      isValid: allErrors.length === 0,
      totalRows: dataRows.length,
      validRows: validData.length,
      invalidRows: processedRows.length - validData.length,
      warnings: [], // Vazio por compatibilidade, warnings individuais estão nos processedRows
      errors: allErrors,
      data: validData,
      preview: processedRows.slice(0, 5)
    };
  }
}

/**
 * Função de compatibilidade com o sistema anterior
 */
export const parseAndPrepareBudgets = (csvText: string, userId: string): any[] => {
  const parser = new EnhancedCsvParser();
  const result = parser.parseAndValidate(csvText, userId);
  
  if (result.errors.length > 0) {
    throw new Error(`Erros encontrados durante a importação:\n${result.errors.join('\n')}`);
  }
  
  return result.data;
};