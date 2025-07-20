import { normalizeHeader, normalizeDataString } from './normalizer';
import { ValidationResult, ParsedRow, ImportSummary } from './validationTypes';

// Mapeamento de campos CSV para banco de dados
const CSV_TO_DB_MAPPING: { [key: string]: { dbField: string; csvHeaders: string[]; required: boolean; type: string } } = {
  client_name: { dbField: 'client_name', csvHeaders: ['cliente', 'nome_cliente', 'client_name'], required: true, type: 'string' },
  client_phone: { dbField: 'client_phone', csvHeaders: ['telefone', 'phone', 'client_phone'], required: false, type: 'string' },
  device_type: { dbField: 'device_type', csvHeaders: ['tipo_aparelho', 'device_type', 'tipo'], required: true, type: 'string' },
  device_model: { dbField: 'device_model', csvHeaders: ['modelo_aparelho', 'device_model', 'modelo'], required: true, type: 'string' },
  issue: { dbField: 'issue', csvHeaders: ['servico_realizado', 'issue', 'problema', 'servico'], required: false, type: 'string' },
  part_quality: { dbField: 'part_quality', csvHeaders: ['qualidade', 'part_quality', 'qualidade_peca'], required: false, type: 'string' },
  total_price: { dbField: 'total_price', csvHeaders: ['preco_total', 'total_price', 'valor_total', 'preco'], required: true, type: 'number' },
  cash_price: { dbField: 'cash_price', csvHeaders: ['preco_avista', 'cash_price', 'valor_avista'], required: false, type: 'number' },
  installment_price: { dbField: 'installment_price', csvHeaders: ['preco_parcelado', 'installment_price', 'valor_parcelado'], required: false, type: 'number' },
  installments: { dbField: 'installments', csvHeaders: ['parcelas', 'installments', 'num_parcelas'], required: false, type: 'number' },
  warranty_months: { dbField: 'warranty_months', csvHeaders: ['garantia_meses', 'warranty_months', 'garantia'], required: false, type: 'number' },
  delivery_date: { dbField: 'delivery_date', csvHeaders: ['data_entrega', 'delivery_date', 'entrega'], required: false, type: 'date' },
  notes: { dbField: 'notes', csvHeaders: ['observacoes', 'notes', 'obs'], required: false, type: 'string' }
};

/**
 * Parser CSV unificado com detecção padronizada de cabeçalho e cálculos financeiros corretos
 */
export class UnifiedCsvParser {
  
  /**
   * Detecção de cabeçalho padronizada - busca por múltiplos padrões
   */
  private findHeaderRow(lines: string[]): { headerIndex: number; headerRow: string } {
    const requiredFields = Object.keys(CSV_TO_DB_MAPPING).filter(key => CSV_TO_DB_MAPPING[key].required);
    
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      if (!line || line.trim() === '') continue;
      
      const headers = this.parseLineToArray(line).map(h => normalizeHeader(h));
      
      // Verificar se contém pelo menos os campos obrigatórios
      const foundRequired = requiredFields.filter(required => {
        const mapping = CSV_TO_DB_MAPPING[required];
        return mapping && mapping.csvHeaders.some(csvHeader => 
          headers.some(header => 
            header === normalizeHeader(csvHeader) || 
            header.includes(normalizeHeader(csvHeader)) || 
            normalizeHeader(csvHeader).includes(header)
          )
        );
      });
      
      if (foundRequired.length >= requiredFields.length) {
        return { headerIndex: i, headerRow: line };
      }
    }
    
    throw new Error('Cabeçalho não encontrado. Verifique se o arquivo CSV contém os campos: cliente, tipo_aparelho, modelo_aparelho, preco_total.');
  }

  /**
   * Parse de linha para array, respeitando aspas e delimitadores
   */
  private parseLineToArray(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escape de aspas duplas
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ';' || char === ',') && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
        continue;
      } else {
        current += char;
      }
      i++;
    }

    result.push(current.trim());
    return result.map(cell => cell.replace(/^["']|["']$/g, '').trim());
  }

  /**
   * Parsing de números com correção de cálculos financeiros
   */
  private parseFinancialValue(value: any): number {
    if (!value) return 0;
    
    const stringValue = value.toString().trim();
    if (!stringValue) return 0;
    
    // Remove todos os caracteres não numéricos exceto vírgula, ponto e menos
    let cleanValue = stringValue.replace(/[^\d.,-]/g, '');
    
    // Se tem vírgula como decimal (padrão brasileiro)
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      // Formato: 1.234.567,89 -> remove pontos de milhar e converte vírgula
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else if (cleanValue.includes(',')) {
      // Formato: 1234,89 -> converte vírgula para ponto
      cleanValue = cleanValue.replace(',', '.');
    }
    
    const parsed = parseFloat(cleanValue);
    if (isNaN(parsed)) return 0;
    
    // Correção automática de valores em centavos (muito comuns em exportações de sistemas)
    // Se o valor é muito alto (>100000), provavelmente está em centavos
    if (parsed > 100000) {
      return Math.round((parsed / 100) * 100) / 100; // Divide por 100 e arredonda para 2 casas
    }
    
    return Math.round(parsed * 100) / 100; // Arredonda para 2 casas decimais
  }

  /**
   * Parsing de booleano
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (!value) return false;
    
    const stringValue = normalizeDataString(value.toString().toLowerCase());
    return ['sim', 'yes', 'true', '1', 'verdadeiro', 'ativo'].includes(stringValue);
  }

  /**
   * Validação de campo individual
   */
  private validateField(fieldKey: string, value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const mapping = CSV_TO_DB_MAPPING[fieldKey];
    let processedValue = value;

    if (!mapping) {
      return { isValid: true, errors: [], warnings: [], data: value };
    }

    // Verificar campo obrigatório
    if (mapping.required && (!value || value.toString().trim() === '')) {
      errors.push(`Campo obrigatório '${fieldKey}' está vazio`);
      return { isValid: false, errors, warnings, data: null };
    }

    // Processar por tipo
    try {
      switch (mapping.type) {
        case 'number':
          processedValue = this.parseFinancialValue(value);
          if (mapping.required && processedValue === 0 && value && value.toString().trim() !== '0') {
            warnings.push(`Valor financeiro pode estar incorreto: '${value}' convertido para ${processedValue}`);
          }
          break;
          
        case 'boolean':
          processedValue = this.parseBoolean(value);
          break;
          
        case 'string':
          processedValue = value ? value.toString().trim() : '';
          if (mapping.required && !processedValue) {
            errors.push(`Campo '${fieldKey}' não pode estar vazio`);
          }
          break;
          
        case 'date':
          if (value) {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
              errors.push(`Data inválida em '${fieldKey}': ${value}`);
            } else {
              processedValue = dateValue.toISOString().split('T')[0];
            }
          }
          break;
      }
    } catch (error) {
      errors.push(`Erro ao processar campo '${fieldKey}': ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: processedValue
    };
  }

  /**
   * Mapear header CSV para campo do banco
   */
  private mapHeaderToField(header: string): string | null {
    const normalizedHeader = normalizeHeader(header);
    
    for (const [fieldKey, mapping] of Object.entries(CSV_TO_DB_MAPPING)) {
      if (mapping.csvHeaders.some(csvHeader => 
        normalizeHeader(csvHeader) === normalizedHeader ||
        normalizedHeader.includes(normalizeHeader(csvHeader)) ||
        normalizeHeader(csvHeader).includes(normalizedHeader)
      )) {
        return fieldKey;
      }
    }
    
    return null;
  }

  /**
   * Processamento de linha individual
   */
  private processRow(rowData: { [key: string]: string }, rowIndex: number): ParsedRow {
    const processedData: { [key: string]: any } = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // Mapear e validar cada campo
    for (const [header, value] of Object.entries(rowData)) {
      const fieldKey = this.mapHeaderToField(header);
      
      if (fieldKey) {
        const validation = this.validateField(fieldKey, value);
        
        processedData[fieldKey] = validation.data;
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      }
    }

    // Cálculos financeiros derivados
    if (processedData.total_price) {
      const totalPrice = processedData.total_price;
      
      // Se não tem cash_price, assume desconto de 5%
      if (!processedData.cash_price || processedData.cash_price === 0) {
        processedData.cash_price = Math.round(totalPrice * 0.95 * 100) / 100;
        warnings.push('Preço à vista calculado automaticamente (desconto de 5%)');
      }
      
      // Se não tem installment_price, assume acréscimo de 10%
      if (!processedData.installment_price || processedData.installment_price === 0) {
        processedData.installment_price = Math.round(totalPrice * 1.10 * 100) / 100;
        warnings.push('Preço parcelado calculado automaticamente (acréscimo de 10%)');
      }
      
      // Validar consistência dos preços
      if (processedData.cash_price > totalPrice) {
        warnings.push('Preço à vista maior que preço total - verifique os valores');
      }
      
      if (processedData.installment_price < totalPrice) {
        warnings.push('Preço parcelado menor que preço total - verifique os valores');
      }
    }

    return {
      rowIndex,
      data: processedData,
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Conversão para formato do banco de dados
   */
  private convertToDatabase(processedRow: ParsedRow, userId: string): any {
    const data = processedRow.data;
    
    return {
      // Campos obrigatórios
      owner_id: userId,
      client_name: data.client_name || 'Cliente não informado',
      device_type: data.device_type || 'Dispositivo',
      device_model: data.device_model || 'Modelo não informado',
      total_price: data.total_price || 0,
      
      // Campos financeiros
      cash_price: data.cash_price || data.total_price,
      installment_price: data.installment_price || data.total_price,
      
      // Campos opcionais
      client_phone: data.client_phone || null,
      issue: data.issue || null,
      part_quality: data.part_quality || 'Original',
      warranty_months: data.warranty_months || 3,
      delivery_date: data.delivery_date || null,
      notes: data.notes || null,
      
      // Campos calculados
      valid_until: data.delivery_date ? 
        new Date(new Date(data.delivery_date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      payment_condition: data.installments && data.installments > 1 ? 
        `${data.installments}x de R$ ${(data.installment_price / data.installments).toFixed(2)}` : 
        'À Vista',
      
      // Status padrão
      status: 'pending',
      workflow_status: 'pending',
      is_paid: false,
      is_delivered: false
    };
  }

  /**
   * Método principal de parsing e validação
   */
  public parseAndValidate(csvText: string, userId: string): ImportSummary {
    try {
      if (!csvText || csvText.trim() === '') {
        throw new Error('Arquivo CSV está vazio');
      }

      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error('Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
      }

      // Detectar cabeçalho
      const { headerIndex, headerRow } = this.findHeaderRow(lines);
      const headers = this.parseLineToArray(headerRow);
      
      // Processar dados
      const dataLines = lines.slice(headerIndex + 1);
      const processedRows: ParsedRow[] = [];
      const globalErrors: string[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        if (!line || line.trim() === '') continue;

        try {
          const cells = this.parseLineToArray(line);
          const rowData: { [key: string]: string } = {};
          
          // Mapear células para cabeçalhos
          headers.forEach((header, index) => {
            rowData[header] = cells[index] || '';
          });

          const processedRow = this.processRow(rowData, i + headerIndex + 2); // +2 para número de linha real
          processedRows.push(processedRow);
        } catch (error) {
          globalErrors.push(`Erro na linha ${i + headerIndex + 2}: ${error}`);
        }
      }

      // Converter para formato do banco
      const validRows = processedRows.filter(row => row.isValid);
      const invalidRows = processedRows.filter(row => !row.isValid);
      
      const dataForDatabase = validRows.map(row => this.convertToDatabase(row, userId));

      // Coletar estatísticas
      const allErrors = [
        ...globalErrors,
        ...processedRows.flatMap(row => row.errors)
      ];
      
      const allWarnings = processedRows.flatMap(row => row.warnings);

      return {
        isValid: allErrors.length === 0,
        totalRows: processedRows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
        data: dataForDatabase,
        errors: allErrors,
        warnings: allWarnings,
        preview: processedRows.slice(0, 5) // Primeiras 5 linhas para preview
      };

    } catch (error) {
      return {
        isValid: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        data: [],
        errors: [error instanceof Error ? error.message : 'Erro desconhecido ao processar CSV'],
        warnings: [],
        preview: []
      };
    }
  }
}

// Função de compatibilidade para manter a API existente
export const parseAndPrepareBudgets = (csvText: string, userId: string): any[] => {
  const parser = new UnifiedCsvParser();
  const result = parser.parseAndValidate(csvText, userId);
  
  if (!result.isValid) {
    throw new Error(`Erros encontrados: ${result.errors.join(', ')}`);
  }
  
  return result.data;
};