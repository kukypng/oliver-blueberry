import React, { useState } from 'react';
import { Download, Filter, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CsvExportFilters as FilterType, CsvBudgetData } from '@/types/csv';

interface CsvExportFiltersProps {
  onExport: (data: CsvBudgetData[], filters?: FilterType) => void;
}

export const CsvExportFilters: React.FC<CsvExportFiltersProps> = ({ onExport }) => {
  const [filters, setFilters] = useState<FilterType>({});
  const [useFilters, setUseFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMultiSelectChange = (key: keyof FilterType, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  };

  const resetFilters = () => {
    setFilters({});
    setUseFilters(false);
  };

  const handleExport = () => {
    // TODO: Get actual budget data from the system
    const sampleData: CsvBudgetData[] = [
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
      }
    ];

    onExport(sampleData, useFilters ? filters : undefined);
  };

  const deviceTypes = ['celular', 'tablet', 'notebook', 'smartwatch'];
  const paymentMethods = ['À Vista', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro'];

  return (
    <div className="space-y-6">
      {/* Filter Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Exportação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-filters"
              checked={useFilters}
              onCheckedChange={setUseFilters}
            />
            <Label htmlFor="use-filters">Aplicar filtros na exportação</Label>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {useFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configurar Filtros</CardTitle>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Types */}
            <div>
              <Label className="text-sm font-medium">Tipos de Aparelho</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {deviceTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`device-${type}`}
                      checked={(filters.tipo_aparelho || []).includes(type)}
                      onChange={() => handleMultiSelectChange('tipo_aparelho', type)}
                      className="rounded"
                    />
                    <Label htmlFor={`device-${type}`} className="text-sm capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preco-min">Preço Mínimo (R$)</Label>
                <Input
                  id="preco-min"
                  type="number"
                  placeholder="0"
                  value={filters.preco_min || ''}
                  onChange={(e) => handleFilterChange('preco_min', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="preco-max">Preço Máximo (R$)</Label>
                <Input
                  id="preco-max"
                  type="number"
                  placeholder="9999"
                  value={filters.preco_max || ''}
                  onChange={(e) => handleFilterChange('preco_max', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Warranty Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="garantia-min">Garantia Mínima (meses)</Label>
                <Input
                  id="garantia-min"
                  type="number"
                  placeholder="0"
                  value={filters.garantia_min || ''}
                  onChange={(e) => handleFilterChange('garantia_min', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="garantia-max">Garantia Máxima (meses)</Label>
                <Input
                  id="garantia-max"
                  type="number"
                  placeholder="24"
                  value={filters.garantia_max || ''}
                  onChange={(e) => handleFilterChange('garantia_max', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Validity Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validade-min">Validade Mínima (dias)</Label>
                <Input
                  id="validade-min"
                  type="number"
                  placeholder="0"
                  value={filters.validade_min || ''}
                  onChange={(e) => handleFilterChange('validade_min', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="validade-max">Validade Máxima (dias)</Label>
                <Input
                  id="validade-max"
                  type="number"
                  placeholder="365"
                  value={filters.validade_max || ''}
                  onChange={(e) => handleFilterChange('validade_max', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label className="text-sm font-medium">Métodos de Pagamento</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {paymentMethods.map(method => (
                  <div key={method} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`payment-${method}`}
                      checked={(filters.metodo_pagamento || []).includes(method)}
                      onChange={() => handleMultiSelectChange('metodo_pagamento', method)}
                      className="rounded"
                    />
                    <Label htmlFor={`payment-${method}`} className="text-sm">
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Inclui Entrega</Label>
                <Select
                  value={filters.inclui_entrega === undefined ? 'all' : filters.inclui_entrega.toString()}
                  onValueChange={(value) => 
                    handleFilterChange('inclui_entrega', 
                      value === 'all' ? undefined : value === 'true'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Inclui Película</Label>
                <Select
                  value={filters.inclui_pelicula === undefined ? 'all' : filters.inclui_pelicula.toString()}
                  onValueChange={(value) => 
                    handleFilterChange('inclui_pelicula', 
                      value === 'all' ? undefined : value === 'true'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados CSV
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              {useFilters 
                ? 'Exportação será filtrada conforme configuração acima'
                : 'Todos os orçamentos serão exportados'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};