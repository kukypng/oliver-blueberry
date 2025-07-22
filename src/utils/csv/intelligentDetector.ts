/**
 * 🧠 INTELLIGENT CSV DETECTOR - Sistema de Detecção Inteligente
 * 
 * Detecta automaticamente estruturas, encoding, separadores e tipos de dados
 * para compatibilidade total com qualquer formato CSV.
 */

export interface DetectionResult {
  fileType: 'budgets' | 'clients' | 'parts' | 'mixed' | 'unknown';
  encoding: 'utf-8' | 'iso-8859-1' | 'windows-1252';
  separator: ';' | ',' | '|' | '\t';
  hasHeaders: boolean;
  headerRow: number;
  totalRows: number;
  confidence: number;
  suggestions: string[];
}

export interface ColumnMapping {
  csvIndex: number;
  csvHeader: string;
  standardField: string;
  confidence: number;
  suggestions: string[];
}

export class IntelligentCsvDetector {
  private separators = [';', ',', '|', '\t'];
  private encodings = ['utf-8', 'iso-8859-1', 'windows-1252'];
  
  // Patterns for different data types
  private budgetPatterns = [
    /modelo|device|aparelho/i,
    /preco|price|valor|total/i,
    /cliente|client|nome/i,
    /telefone|phone|celular/i
  ];
  
  private clientPatterns = [
    /nome|name|cliente/i,
    /telefone|phone|celular/i,
    /email|e-mail/i,
    /endereco|address/i
  ];
  
  private partPatterns = [
    /parte|part|peca/i,
    /preco|price|valor/i,
    /quantidade|quantity|qtd/i,
    /garantia|warranty/i
  ];

  /**
   * Detecta automaticamente a estrutura do arquivo CSV
   */
  async detectStructure(csvText: string): Promise<DetectionResult> {
    const lines = this.splitLines(csvText);
    
    // Detectar separador
    const separator = this.detectSeparator(lines);
    
    // Detectar linha de cabeçalho
    const headerInfo = this.detectHeaderRow(lines, separator);
    
    // Detectar tipo de dados
    const fileType = this.detectFileType(lines, separator, headerInfo.headerRow);
    
    // Calcular confiança e sugestões
    const confidence = this.calculateConfidence(lines, separator, headerInfo, fileType);
    const suggestions = this.generateSuggestions(lines, separator, fileType);
    
    return {
      fileType,
      encoding: 'utf-8', // Default, pode ser melhorado
      separator,
      hasHeaders: headerInfo.hasHeaders,
      headerRow: headerInfo.headerRow,
      totalRows: lines.length,
      confidence,
      suggestions
    };
  }

  /**
   * Mapeia colunas automaticamente para campos padronizados
   */
  mapColumns(csvText: string, detection: DetectionResult): ColumnMapping[] {
    const lines = this.splitLines(csvText);
    const headerLine = lines[detection.headerRow];
    
    if (!headerLine) return [];
    
    const headers = this.parseRow(headerLine, detection.separator);
    const mappings: ColumnMapping[] = [];
    
    headers.forEach((header, index) => {
      const mapping = this.findBestMatch(header, detection.fileType);
      mappings.push({
        csvIndex: index,
        csvHeader: header,
        standardField: mapping.field,
        confidence: mapping.confidence,
        suggestions: mapping.suggestions
      });
    });
    
    return mappings;
  }

  /**
   * Detecta o separador mais provável
   */
  private detectSeparator(lines: string[]): ';' | ',' | '|' | '\t' {
    const sampleLines = lines.slice(0, 10);
    const separatorScores = new Map<string, number>();
    
    for (const separator of this.separators) {
      let score = 0;
      let consistency = 0;
      const columnCounts: number[] = [];
      
      for (const line of sampleLines) {
        if (!line.trim()) continue;
        
        const columns = this.parseRow(line, separator);
        const columnCount = columns.length;
        columnCounts.push(columnCount);
        
        // Mais colunas = melhor score
        score += columnCount;
      }
      
      // Penalizar inconsistência
      if (columnCounts.length > 1) {
        const avgCols = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
        consistency = columnCounts.reduce((acc, count) => {
          return acc + Math.abs(count - avgCols);
        }, 0) / columnCounts.length;
        
        score -= consistency * 10;
      }
      
      separatorScores.set(separator, score);
    }
    
    // Retorna o separador com maior score
    let bestSeparator = ';';
    let bestScore = -1;
    
    for (const [separator, score] of separatorScores) {
      if (score > bestScore) {
        bestScore = score;
        bestSeparator = separator as ';' | ',' | '|' | '\t';
      }
    }
    
    return bestSeparator;
  }

  /**
   * Detecta a linha de cabeçalho
   */
  private detectHeaderRow(lines: string[], separator: string): { hasHeaders: boolean; headerRow: number } {
    // Testa as primeiras 5 linhas
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const columns = this.parseRow(lines[i], separator);
      
      // Verifica se parece com cabeçalho
      let headerScore = 0;
      
      for (const column of columns) {
        const text = column.toLowerCase().trim();
        
        // Headers típicos têm palavras conhecidas
        if (text.includes('nome') || text.includes('name')) headerScore += 3;
        if (text.includes('preco') || text.includes('price')) headerScore += 3;
        if (text.includes('telefone') || text.includes('phone')) headerScore += 3;
        if (text.includes('modelo') || text.includes('device')) headerScore += 3;
        if (text.includes('cliente') || text.includes('client')) headerScore += 3;
        
        // Headers não têm números/valores monetários
        if (/^\d+/.test(text)) headerScore -= 2;
        if (/r\$\s*\d+/.test(text)) headerScore -= 2;
        
        // Headers têm texto descritivo
        if (text.length > 3 && !/^\d+$/.test(text)) headerScore += 1;
      }
      
      // Se score for alto o suficiente, é um cabeçalho
      if (headerScore >= 5) {
        return { hasHeaders: true, headerRow: i };
      }
    }
    
    return { hasHeaders: false, headerRow: 0 };
  }

  /**
   * Detecta o tipo de arquivo baseado nos dados
   */
  private detectFileType(lines: string[], separator: string, headerRow: number): 'budgets' | 'clients' | 'parts' | 'mixed' | 'unknown' {
    const sampleSize = Math.min(10, lines.length - headerRow);
    const sampleLines = lines.slice(headerRow, headerRow + sampleSize);
    
    let budgetScore = 0;
    let clientScore = 0;
    let partScore = 0;
    
    for (const line of sampleLines) {
      const columns = this.parseRow(line, separator);
      const lineText = line.toLowerCase();
      
      // Score por padrões de orçamentos
      for (const pattern of this.budgetPatterns) {
        if (pattern.test(lineText)) budgetScore++;
      }
      
      // Score por padrões de clientes
      for (const pattern of this.clientPatterns) {
        if (pattern.test(lineText)) clientScore++;
      }
      
      // Score por padrões de partes
      for (const pattern of this.partPatterns) {
        if (pattern.test(lineText)) partScore++;
      }
      
      // Detecta valores monetários (comum em orçamentos)
      if (/r\$\s*\d+|[\d,]+\.\d{2}/.test(lineText)) {
        budgetScore += 2;
      }
      
      // Detecta telefones (comum em clientes)
      if (/\(\d{2}\)\s*\d{4,5}-?\d{4}/.test(lineText)) {
        clientScore += 2;
      }
    }
    
    const maxScore = Math.max(budgetScore, clientScore, partScore);
    
    if (maxScore === 0) return 'unknown';
    if (budgetScore > clientScore && budgetScore > partScore) return 'budgets';
    if (clientScore > budgetScore && clientScore > partScore) return 'clients';
    if (partScore > budgetScore && partScore > clientScore) return 'parts';
    
    return 'mixed';
  }

  /**
   * Calcula confiança na detecção
   */
  private calculateConfidence(
    lines: string[], 
    separator: string, 
    headerInfo: { hasHeaders: boolean; headerRow: number }, 
    fileType: string
  ): number {
    let confidence = 50; // Base
    
    // Headers detectados corretamente aumentam confiança
    if (headerInfo.hasHeaders) confidence += 20;
    
    // Tipo conhecido aumenta confiança
    if (fileType !== 'unknown') confidence += 20;
    
    // Consistência de colunas
    const sampleLines = lines.slice(0, 10);
    const columnCounts = sampleLines.map(line => this.parseRow(line, separator).length);
    const avgCols = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
    const variance = columnCounts.reduce((acc, count) => acc + Math.pow(count - avgCols, 2), 0) / columnCounts.length;
    
    if (variance < 2) confidence += 10; // Baixa variância = boa consistência
    
    return Math.min(100, confidence);
  }

  /**
   * Gera sugestões para o usuário
   */
  private generateSuggestions(lines: string[], separator: string, fileType: string): string[] {
    const suggestions: string[] = [];
    
    if (fileType === 'unknown') {
      suggestions.push('Não foi possível determinar o tipo de dados. Verifique se o arquivo contém informações de orçamentos, clientes ou partes.');
    }
    
    if (lines.length < 2) {
      suggestions.push('Arquivo muito pequeno. Certifique-se de que há dados suficientes.');
    }
    
    // Verificar se há dados suficientes
    const dataLines = lines.filter(line => line.trim() && this.parseRow(line, separator).length > 1);
    if (dataLines.length < 1) {
      suggestions.push('Nenhuma linha de dados válida encontrada. Verifique o formato do arquivo.');
    }
    
    return suggestions;
  }

  /**
   * Encontra a melhor correspondência para um campo
   */
  private findBestMatch(csvHeader: string, fileType: string): { field: string; confidence: number; suggestions: string[] } {
    const normalizedHeader = this.normalizeText(csvHeader);
    
    // Mapeamentos por tipo
    const budgetMappings = {
      'device_model': ['modelo', 'device', 'aparelho', 'model'],
      'device_type': ['tipo', 'type', 'categoria'],
      'total_price': ['preco', 'price', 'valor', 'total'],
      'client_name': ['cliente', 'client', 'nome', 'name'],
      'client_phone': ['telefone', 'phone', 'celular', 'tel'],
      'issue': ['problema', 'issue', 'servico', 'defeito'],
      'part_quality': ['qualidade', 'quality', 'grade'],
      'warranty_months': ['garantia', 'warranty', 'meses'],
      'payment_condition': ['pagamento', 'payment', 'condicao']
    };
    
    const clientMappings = {
      'name': ['nome', 'name', 'cliente'],
      'phone': ['telefone', 'phone', 'celular'],
      'email': ['email', 'e-mail', 'mail'],
      'address': ['endereco', 'address', 'rua'],
      'city': ['cidade', 'city'],
      'state': ['estado', 'state', 'uf']
    };
    
    const mappings = fileType === 'clients' ? clientMappings : budgetMappings;
    
    let bestMatch = 'unknown';
    let bestScore = 0;
    const suggestions: string[] = [];
    
    for (const [field, keywords] of Object.entries(mappings)) {
      for (const keyword of keywords) {
        const score = this.calculateSimilarity(normalizedHeader, keyword);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = field;
        }
        
        if (score > 0.6) {
          suggestions.push(`Possível correspondência: ${field}`);
        }
      }
    }
    
    return {
      field: bestMatch,
      confidence: Math.round(bestScore * 100),
      suggestions
    };
  }

  /**
   * Calcula similaridade entre textos (Levenshtein simplificado)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (text1.includes(text2) || text2.includes(text1)) return 0.9;
    
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula distância de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Normaliza texto para comparação
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
      .trim();
  }

  /**
   * Divide o texto em linhas
   */
  private splitLines(text: string): string[] {
    return text.split(/\r?\n/).filter(line => line.trim());
  }

  /**
   * Faz parse de uma linha CSV considerando aspas
   */
  private parseRow(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === separator || line[i - 1] === ' ')) {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    result.push(current.trim());
    return result.map(col => col.replace(/^"|"$/g, ''));
  }
}