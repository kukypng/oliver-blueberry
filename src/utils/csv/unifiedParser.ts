import { normalizeHeader } from './normalizer';
import { 
  ValidationResult, 
  ParsedRow, 
  ImportSummary, 
  FieldMapping, 
  FIELD_MAPPINGS,
  BudgetInsert 
} from './validationTypes';

/**
 * ✅ UNIFIED CSV PARSER - Sistema unificado para parsing CSV
 * 
 * Resolve problemas críticos:
 * - Duplicação de parsers (parser.ts vs enhancedParser.ts)
 * - Inconsistências de cálculos financeiros (conversão múltipla para centavos)
 * - Detecção de cabeçalho frágil e repetida
 * - Validações inconsistentes
 */
export class UnifiedCsvParser {
  private fieldMappings: FieldMapping[];
  
  constructor(fieldMappings: FieldMapping[] = FIELD_MAPPINGS) {
    this.fieldMappings = fieldMappings;
  }

  /**
   * 🔄 DETECÇÃO DE CABEÇALHO PADRONIZADA
   * Busca flexível e robusta do cabeçalho em uma única função
   */
  private findHeaderRow(lines: string[]): number {
    // Primeira tentativa: busca exata dos campos principais
    let headerIndex = lines.findIndex(line => 
      line.includes('Tipo Aparelho') && 
      line.includes('Modelo Aparelho') && 
      line.includes('Preco Total')
    );
    
    // Segunda tentativa: busca normalizada (sem acentos, case insensitive)
    if (headerIndex === -1) {
      headerIndex = lines.findIndex(line => {
        const normalized = line.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return normalized.includes('tipo aparelho') && 
               normalized.includes('modelo aparelho') && 
               normalized.includes('preco total');
      });
    }
    
    // Terceira tentativa: busca por palavras-chave flexível
    if (headerIndex === -1) {
      headerIndex = lines.findIndex(line => {
        const hasDevice = /tipo|aparelho|device/i.test(line);
        const hasModel = /modelo|model/i.test(line);
        const hasPrice = /preco|total|price/i.test(line);
        return hasDevice && hasModel && hasPrice;
      });
    }

    return headerIndex;
  }

  /**
   * 💰 CÁLCULO FINANCEIRO CORRETO
   * Evita conversão múltipla para centavos e corrige valores
   */
  private parseFinancialValue(value: any): number {
    if (typeof value === 'number') return value;
    
    const stringValue = value.toString().trim();
    if (stringValue === '' || stringValue === '0') return 0;
    
    // Normalizar formato brasileiro (vírgula para ponto)
    const normalizedValue = stringValue.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * ✅ VALIDAÇÃO DE CAMPO UNIFICADA
   */
  private validateField(field: FieldMapping, value: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      data: value
    };

    // Campo obrigatório vazio
    if (field.required && (!value || value.toString().trim() === '')) {
      result.isValid = false;
      result.errors.push(`Campo obrigatório '${field.field}' está vazio`);
      return result;
    }

    // Campo opcional vazio - usar valor padrão
    if ((!value || value.toString().trim() === '') && !field.required) {
      result.data = field.defaultValue;
      if (field.defaultValue !== null && field.defaultValue !== undefined && field.defaultValue !== '') {
        result.warnings.push(`Campo '${field.field}' vazio, usando padrão: ${field.defaultValue}`);
      }
      return result;
    }

    // Validação por tipo
    switch (field.type) {
      case 'number':
        const numValue = this.parseFinancialValue(value);
        if (isNaN(numValue) && field.required) {
          result.isValid = false;
          result.errors.push(`Campo '${field.field}' deve ser um número válido`);
        } else {
          result.data = numValue;
          // Validação específica para preços
          if (field.field === 'preco_total' && numValue <= 0) {
            result.isValid = false;
            result.errors.push('Preço total deve ser maior que zero');
          }
        }
        break;

      case 'boolean':
        const stringValue = value.toString().toLowerCase().trim();
        result.data = stringValue === 'sim' || stringValue === 'true' || stringValue === '1';
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
   * 🔄 PROCESSAMENTO DE LINHA UNIFICADO
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
   * 💾 CONVERSÃO PARA BANCO PADRONIZADA
   * Garantia de consistência nos dados salvos
   */
  private convertToDatabase(processedRow: ParsedRow, userId: string): BudgetInsert {
    const data = processedRow.data;
    
    // Calcular data de validade
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validade_dias || 15));

    // Determinar condição de pagamento
    const installments = data.parcelas || 1;
    const installmentPrice = data.preco_parcelado || 0;
    
    // 💰 CORREÇÃO CRÍTICA: Não converter para centavos múltiplas vezes
    const totalPrice = data.preco_total || 0;
    const cashPrice = totalPrice;
    const finalInstallmentPrice = installmentPrice > 0 ? installmentPrice : null;
    
    // Auto-cálculo de preço parcelado se não fornecido
    const autoCalculatedInstallmentPrice = installments > 1 && !finalInstallmentPrice 
      ? Math.round(totalPrice * 1.1) // 10% de acréscimo padrão
      : finalInstallmentPrice;

    const paymentCondition = data.metodo_pagamento || data.condicao_pagamento || 
      ((installments > 1) ? 'Cartao de Credito' : 'A Vista');

    return {
      owner_id: userId,
      device_type: data.tipo_aparelho,
      device_model: data.modelo_aparelho,
      issue: data.qualidade || data.defeito_ou_problema || '',
      part_quality: data.qualidade || '',
      part_type: data.servico_realizado,
      notes: data.observacoes || '',
      
      // 💰 VALORES FINANCEIROS CORRETOS (já em reais, não converter novamente)
      total_price: Math.round(totalPrice * 100), // Converter para centavos APENAS uma vez
      cash_price: Math.round(cashPrice * 100),
      installment_price: autoCalculatedInstallmentPrice ? Math.round(autoCalculatedInstallmentPrice * 100) : null,
      
      installments: installments,
      payment_condition: paymentCondition,
      warranty_months: data.garantia_meses || 3,
      includes_delivery: data.inclui_entrega || false,
      includes_screen_protector: data.inclui_pelicula || false,
      valid_until: validUntil.toISOString(),
      expires_at: validUntil.toISOString().split('T')[0], // Data apenas
      status: 'pending',
      workflow_status: 'pending',
      client_name: null,
      client_phone: null,
    };
  }

  /**
   * 🚀 MÉTODO PRINCIPAL - Análise e validação unificada
   * Substitui parseAndPrepareBudgets e EnhancedCsvParser.parseAndValidate
   */
  public parseAndValidate(csvText: string, userId: string): ImportSummary {
    const allLines = csvText.split(/\r\n|\n/);
    
    console.log('=== UNIFIED CSV PARSER ===');
    console.log('Total de linhas:', allLines.length);
    
    // 🔍 Busca do cabeçalho padronizada
    const headerRowIndex = this.findHeaderRow(allLines);
    
    if (headerRowIndex === -1) {
      console.log('=== DEBUG: LINHAS DO ARQUIVO ===');
      allLines.slice(0, 10).forEach((line, index) => {
        console.log(`${index}: ${JSON.stringify(line)}`);
      });
      
      throw new Error(`Cabeçalho não encontrado. Arquivo deve conter campos:
- 'Tipo Aparelho'
- 'Modelo Aparelho' 
- 'Preco Total'

Verifique o formato e tente novamente.`);
    }

    console.log('Cabeçalho encontrado na linha:', headerRowIndex);

    // Filtrar linhas vazias
    const lines = allLines.slice(headerRowIndex).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("Arquivo deve conter pelo menos uma linha de dados além do cabeçalho.");
    }

    // Processar cabeçalho
    const rawHeaders = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    const normalizedHeaders = rawHeaders.map(normalizeHeader);

    // Processar dados
    const dataRows = lines.slice(1);
    const processedRows: ParsedRow[] = [];
    const validData: BudgetInsert[] = [];
    const allErrors: string[] = [];
    let totalWarnings = 0;

    dataRows.forEach((line, index) => {
      if (line.trim() === '') return;

      // 🔄 Split de CSV robusto (preserva vírgulas dentro de aspas)
      const values = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(v => v.trim().replace(/^"|"$/g, ''));
      
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
      totalRows: dataRows.length,
      validRows: validData.length,
      invalidRows: processedRows.length - validData.length,
      warnings: totalWarnings,
      errors: allErrors,
      processedData: validData
    };
  }

  /**
   * 🔄 COMPATIBILIDADE - Substitui parseAndPrepareBudgets antigo
   * Para componentes que ainda usam a função antiga
   */
  public parseAndPrepareBudgetsLegacy(csvText: string, userId: string): BudgetInsert[] {
    const result = this.parseAndValidate(csvText, userId);
    
    if (result.errors.length > 0) {
      throw new Error(`Erros encontrados durante a importação:\n${result.errors.join('\n')}`);
    }
    
    return result.processedData;
  }
}

/**
 * 🔄 FUNÇÕES DE COMPATIBILIDADE
 * Garantem que código existente continue funcionando
 */
export const parseAndPrepareBudgets = (csvText: string, userId: string): BudgetInsert[] => {
  const parser = new UnifiedCsvParser();
  return parser.parseAndPrepareBudgetsLegacy(csvText, userId);
};

// Alias para compatibilidade com EnhancedCsvParser
export const EnhancedCsvParser = UnifiedCsvParser;