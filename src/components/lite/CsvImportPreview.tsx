import React from 'react';
import { CsvPreviewData, CsvBudgetData } from '@/types/csv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CsvImportPreviewProps {
  previewData: CsvPreviewData;
  validData: CsvBudgetData[];
}

export const CsvImportPreview: React.FC<CsvImportPreviewProps> = ({ 
  previewData, 
  validData 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Prévia dos Dados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Headers Preview */}
          <div>
            <h4 className="font-medium mb-2">Cabeçalhos Detectados:</h4>
            <div className="flex flex-wrap gap-2">
              {previewData.headers.map((header, index) => (
                <Badge 
                  key={index} 
                  variant={header.trim() ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {header.trim() || 'Vazio'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Data Preview Table */}
          {validData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Primeiros Registros Válidos:</h4>
              <ScrollArea className="h-64 w-full border rounded">
                <div className="p-4">
                  <div className="space-y-2">
                    {validData.slice(0, 3).map((item, index) => (
                      <div key={index} className="border rounded p-3 bg-muted/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div><strong>Tipo:</strong> {item.tipo_aparelho}</div>
                          <div><strong>Serviço:</strong> {item.servico_aparelho}</div>
                           <div><strong>Preço à Vista:</strong> R$ {Number.isInteger(item.preco_vista) ? item.preco_vista : item.preco_vista.toFixed(2)}</div>
                           <div><strong>Preço Parcelado:</strong> R$ {Number.isInteger(item.preco_parcelado) ? item.preco_parcelado : item.preco_parcelado.toFixed(2)}</div>
                          <div><strong>Parcelas:</strong> {item.parcelas}x</div>
                          <div><strong>Garantia:</strong> {item.garantia_meses} meses</div>
                          {item.qualidade && (
                            <div><strong>Qualidade:</strong> {item.qualidade}</div>
                          )}
                          {item.observacoes && (
                            <div><strong>Observações:</strong> {item.observacoes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {validData.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        ... e mais {validData.length - 3} registro(s)
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Raw Data Preview */}
          {previewData.rows.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Dados Brutos (Primeiras Linhas):</h4>
              <ScrollArea className="h-32 w-full border rounded">
                <div className="p-2 text-xs font-mono">
                  {previewData.rows.map((row, index) => (
                    <div key={index} className="truncate border-b py-1">
                      {row.join(';')}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};