import React from 'react';
import { Smartphone, Wrench, Award } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeviceFormSectionProps {
  formData: {
    device_type: string;
    device_model: string;
    part_type: string;
    warranty_months: number;
  };
  onInputChange: (field: string, value: string | number) => void;
}

export const DeviceFormSection: React.FC<DeviceFormSectionProps> = ({
  formData,
  onInputChange
}) => {
  const warrantyOptions = [
    { value: 1, label: '1 mês' },
    { value: 3, label: '3 meses' },
    { value: 6, label: '6 meses' },
    { value: 12, label: '1 ano' },
    { value: 24, label: '2 anos' }
  ];

  const deviceTypes = [
    'Celular',
    'Tablet',
    'Notebook',
    'Smartwatch',
    'Outros'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Smartphone className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Informações do Dispositivo</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="device_type" className="text-sm font-medium">
            Tipo de Dispositivo
          </Label>
          <Select
            value={formData.device_type}
            onValueChange={(value) => onInputChange('device_type', value)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {deviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="device_model" className="text-sm font-medium">
            Modelo do Aparelho
          </Label>
          <Input
            id="device_model"
            value={formData.device_model}
            onChange={(e) => onInputChange('device_model', e.target.value)}
            placeholder="Ex: iPhone 12, Redmi Note 8"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="part_type" className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Tipo de Serviço
            </div>
          </Label>
          <Input
            id="part_type"
            value={formData.part_type}
            onChange={(e) => onInputChange('part_type', e.target.value)}
            placeholder="Ex: Troca de tela, Troca de bateria"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty_months" className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Período de Garantia
            </div>
          </Label>
          <Select
            value={formData.warranty_months.toString()}
            onValueChange={(value) => onInputChange('warranty_months', parseInt(value))}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warrantyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};