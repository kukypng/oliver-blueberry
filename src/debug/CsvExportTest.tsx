import React from 'react';
import { CsvBudgetData } from '@/types/csv';
import { NumberDetector } from '@/utils/csv/numberDetector';
import { NumberUtils } from '@/utils/csv/numberUtils';
import { CsvFormatter } from '@/utils/csv/formatter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CsvExportTest: React.FC = () => {
  const testData: CsvBudgetData[] = [
    {
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
    },
    {
      tipo_aparelho: 'celular',
      servico_aparelho: 'Tela Samsung A30',
      qualidade: 'Original',
      observacoes: '',
      preco_vista: 600,
      preco_parcelado: 650,
      parcelas: 5,
      metodo_pagamento: 'À Vista',
      garantia_meses: 3,
      validade_dias: 10,
      inclui_entrega: false,
      inclui_pelicula: true
    },
    {
      tipo_aparelho: 'tablet',
      servico_aparelho: 'Tela iPad Air',
      qualidade: 'Gold',
      observacoes: 'Peça importada',
      preco_vista: 1200,
      preco_parcelado: 1300,
      parcelas: 12,
      metodo_pagamento: 'Cartão de Crédito',
      garantia_meses: 12,
      validade_dias: 30,
      inclui_entrega: true,
      inclui_pelicula: false
    }
  ];

  const runTest = () => {
    console.clear();
    console.log('🧪 === TESTE DE EXPORTAÇÃO CSV ===');
    
    // Teste 1: Detecção de números
    const detection = NumberDetector.analyzeData(testData);
    console.log('🔍 Detecção:', detection);
    
    // Teste 2: Formatação de números
    testData.forEach((item, index) => {
      console.log(`💰 Item ${index + 1}:`, {
        preco_vista_original: item.preco_vista,
        preco_vista_formatado_normal: NumberUtils.formatForCsv(item.preco_vista, false),
        preco_vista_formatado_inteiro: NumberUtils.formatForCsv(item.preco_vista, true),
        preco_parcelado_original: item.preco_parcelado,
        preco_parcelado_formatado_normal: NumberUtils.formatForCsv(item.preco_parcelado, false),
        preco_parcelado_formatado_inteiro: NumberUtils.formatForCsv(item.preco_parcelado, true)
      });
    });
    
    // Teste 3: Formatação completa do CSV
    const csvContent = CsvFormatter.format(testData);
    console.log('📄 CSV Completo:');
    console.log(csvContent);
    
    // Teste 4: Template
    const template = CsvFormatter.generateTemplate();
    console.log('📋 Template:');
    console.log(template);
    
    // Teste 5: Download do teste
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'teste-export.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Teste concluído! Arquivo baixado.');
  };

  return (
    <Card className="max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle>Teste de Exportação CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Este teste vai verificar:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Detecção automática de modo inteiro</li>
              <li>Formatação correta dos números</li>
              <li>Geração do CSV final</li>
              <li>Download do arquivo</li>
            </ul>
          </div>
          
          <Button onClick={runTest} className="w-full">
            Executar Teste de Exportação
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Abra o Console do navegador (F12) para ver os detalhes do teste.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};