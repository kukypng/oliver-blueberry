
import { HeaderMapper, StandardHeader } from './standardHeaders';
import { 
  ValidationResult, 
  ParsedRow, 
  ImportSummary, 
  BudgetInsert 
} from './validationTypes';

/**
 * ✅ PARSER UNIFICADO PADRONIZADO
 * 
 * Resolve problemas de compatibilidade:
 * - Usa mapeamento inteligente de cabeçalhos
 * - Aceita variações e aliases dos campos
 * - Compatibilidade total com arquivos exportados
 * - Validação flexível mas rigorosa
 */
export class UnifiedCsvParser {
  private headerMapper: HeaderMapper;
  
  constructor() {
    this.headerMapper = new HeaderMapper();
  }

  /**
   * 🔍 DETECÇÃO INTELIGENTE DE CABEÇALHO
   * Busca flexível que aceita variações dos nomes de campos
   */
  private findHeaderRow(lines: string[]): number {
    const standardHeaders = this.headerMapper.getStandardHeaders();
    const requiredFields = standardHeaders.filter(h => h.required);
    
    console.log('=== BUSCA DE CABEÇALHO INTELIGENTE ===');
    console.log('Campos obrigatórios:', requiredFields.map(f => f.csvHeader));
    
    // Busca linha que contenha pelo menos os campos obrigatórios
    const headerIndex = lines.findIndex(line => {
      const headers = line.split(';').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Verifica se consegue mapear os campos obrigatórios
      let mappedRequired = 0;
      headers.forEach(header => {
        const standardHeader = this.headerMapper.findStandardHeader(header);
        if (standardHeader && standardHeader.required) {
          mappedRequired++;
        }
      });
      
      const hasRequiredFields = mappedRequired >= requiredFields.length;
      
      if (hasRequiredFields) {
        console.log(`Cabeçalho encontrado na linha ${lines.indexOf(line)}:`, headers);
        console.log(`Campos obrigatórios mapeados: ${mappedRequired}/${requiredFields.length}`);
      }
      
      return hasRequiredFields;
    });

    return headerIndex;
  }

  /**
   * 💰 PROCESSAMENTO FINANCEIRO PADRONIZADO
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
   * ✅ VALIDAÇÃO PADRONIZADA POR TIPO
   */
  private validateField(standardHeader: StandardHeader, value: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      data: value
    };

    // Campo obrigatório vazio
    if (standardHeader.required && (!value || value.toString().trim() === '')) {
      result.isValid = false;
      result.errors.push(`Campo obrigatório '${standardHeader.csvHeader}' está vazio`);
      return result;
    }

    // Campo opcional vazio - usar valor padrão
    if ((!value || value.toString().trim() === '') && !standardHeader.required) {
      result.data = standardHeader.defaultValue;
      if (standardHeader.defaultValue !== null && standardHeader.defaultValue !== undefined && standardHeader.defaultValue !== '') {
        result.warnings.push(`Campo '${standardHeader.csvHeader}' vazio, usando padrão: ${standardHeader.defaultValue}`);
      }
      return result;
    }

    // Validação por tipo
    switch (standardHeader.type) {
      case 'number':
        const numValue = this.parseFinancialValue(value);
        if (isNaN(numValue) && standardHeader.required) {
          result.isValid = false;
          result.errors.push(`Campo '${standardHeader.csvHeader}' deve ser um número válido`);
        } else {
          result.data = numValue;
          // Validação específica para preços
          if (standardHeader.fieldName === 'preco_total' && numValue <= 0) {
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
   * 🔄 PROCESSAMENTO DE LINHA PADRONIZADO
   */
  private processRow(csvValues: string[], headerMapping: { [csvIndex: number]: StandardHeader }, rowIndex: number): ParsedRow {
    const processedRow: ParsedRow = {
      rowIndex,
      data: {},
      errors: [],
      warnings: [],
      isValid: true
    };

    // Processar todos os campos mapeados
    Object.entries(headerMapping).forEach(([csvIndex, standardHeader]) => {
      const value = csvValues[parseInt(csvIndex)] || '';
      const validation = this.validateField(standardHeader, value);
      
      processedRow.data[standardHeader.fieldName] = validation.data;
      processedRow.errors.push(...validation.errors);
      processedRow.warnings.push(...validation.warnings);
      
      if (!validation.isValid) {
        processedRow.isValid = false;
      }
    });

    // Verificar se todos os campos obrigatórios foram mapeados
    const standardHeaders = this.headerMapper.getStandardHeaders();
    const requiredHeaders = standardHeaders.filter(h => h.required);
    const mappedRequiredFields = Object.values(headerMapping).filter(h => h.required);
    
    if (mappedRequiredFields.length < requiredHeaders.length) {
      const missingFields = requiredHeaders
        .filter(req => !Object.values(headerMapping).some(mapped => mapped.fieldName === req.fieldName))
        .map(h => h.csvHeader);
      
      processedRow.isValid = false;
      processedRow.errors.push(`Campos obrigatórios não encontrados: ${missingFields.join(', ')}`);
    }

    return processedRow;
  }

  /**
   * 💾 CONVERSÃO PARA BANCO PADRONIZADA
   */
  private convertToDatabase(processedRow: ParsedRow, userId: string): BudgetInsert {
    const data = processedRow.data;
    
    // Calcular data de validade
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validade_dias || 15));

    // Determinar condição de pagamento
    const installments = data.parcelas || 1;
    const installmentPrice = data.preco_parcelado || 0;
    
    // 💰 CONVERSÃO FINANCEIRA CORRETA
    const totalPrice = data.preco_total || 0;
    const cashPrice = totalPrice;
    const finalInstallmentPrice = installmentPrice > 0 ? installmentPrice : null;
    
    // Auto-cálculo de preço parcelado se necessário
    const autoCalculatedInstallmentPrice = installments > 1 && !finalInstallmentPrice 
      ? Math.round(totalPrice * 1.1) // 10% de acréscimo padrão
      : finalInstallmentPrice;

    const paymentCondition = data.metodo_pagamento || 
      ((installments > 1) ? 'Cartao de Credito' : 'A Vista');

    return {
      owner_id: userId,
      device_type: data.tipo_aparelho,
      device_model: data.modelo_aparelho,
      issue: data.qualidade || '',
      part_quality: data.qualidade || '',
      part_type: data.servico_realizado,
      notes: data.observacoes || '',
      
      // 💰 VALORES FINANCEIROS (conversão única para centavos)
      total_price: Math.round(totalPrice * 100),
      cash_price: Math.round(cashPrice * 100),
      installment_price: autoCalculatedInstallmentPrice ? Math.round(autoCalculatedInstallmentPrice * 100) : null,
      
      installments: installments,
      payment_condition: paymentCondition,
      warranty_months: data.garantia_meses || 3,
      includes_delivery: data.inclui_entrega || false,
      includes_screen_protector: data.inclui_pelicula || false,
      valid_until: validUntil.toISOString(),
      expires_at: validUntil.toISOString().split('T')[0],
      status: 'pending',
      workflow_status: 'pending',
      client_name: null,
      client_phone: null,
    };
  }

  /**
   * 🚀 MÉTODO PRINCIPAL - Análise e validação padronizada
   */
  public parseAndValidate(csvText: string, userId: string): ImportSummary {
    const allLines = csvText.split(/\r\n|\n/);
    
    console.log('=== PARSER UNIFICADO PADRONIZADO ===');
    console.log('Total de linhas:', allLines.length);
    
    // 🔍 Busca inteligente do cabeçalho
    const headerRowIndex = this.findHeaderRow(allLines);
    
    if (headerRowIndex === -1) {
      throw new Error(`Cabeçalho não encontrado. O arquivo deve conter pelo menos os campos obrigatórios:
${this.headerMapper.getStandardHeaders().filter(h => h.required).map(h => `- ${h.csvHeader}`).join('\n')}

Variações aceitas são suportadas. Verifique se o arquivo está no formato correto.`);
    }

    console.log('Cabeçalho encontrado na linha:', headerRowIndex);

    // Filtrar linhas vazias
    const lines = allLines.slice(headerRowIndex).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("Arquivo deve conter pelo menos uma linha de dados além do cabeçalho.");
    }

    // 📋 Processar cabeçalho e criar mapeamento
    const rawHeaders = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    const headerMapping = this.headerMapper.mapHeaders(rawHeaders);

    console.log('Mapeamento de cabeçalhos:', headerMapping);
    console.log('Cabeçalhos encontrados:', Object.keys(headerMapping).length);

    // 🔄 Processar linhas de dados
    const dataRows = lines.slice(1);
    const processedRows: ParsedRow[] = [];
    const validData: BudgetInsert[] = [];
    const allErrors: string[] = [];
    let totalWarnings = 0;

    dataRows.forEach((line, index) => {
      if (line.trim() === '') return;

      // Split CSV robusto
      const values = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(v => v.trim().replace(/^"|"$/g, ''));
      
      // Processar linha
      const processedRow = this.processRow(values, headerMapping, index + 1);
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

    console.log('Resultado do parsing:', {
      totalRows: dataRows.length,
      validRows: validData.length,
      invalidRows: processedRows.length - validData.length,
      warnings: totalWarnings,
      errors: allErrors.length
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
   * 🔄 COMPATIBILIDADE - Método legado
   */
  public parseAndPrepareBudgetsLegacy(csvText: string, userId: string): BudgetInsert[] {
    const result = this.parseAndValidate(csvText, userId);
    
    if (result.errors.length > 0) {
      throw new Error(`Erros encontrados durante a importação:\n${result.errors.join('\n')}`);
    }
    
    return result.processedData;
  }
}

// 🔄 FUNÇÕES DE COMPATIBILIDADE
export const parseAndPrepareBudgets = (csvText: string, userId: string): BudgetInsert[] => {
  const parser = new UnifiedCsvParser();
  return parser.parseAndPrepareBudgetsLegacy(csvText, userId);
};

export const EnhancedCsvParser = UnifiedCsvParser;
