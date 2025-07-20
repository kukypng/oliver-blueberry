import React from 'react';
import { DollarSign, CreditCard } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PricingFormSectionProps {
  formData: {
    cash_price: number;
    installment_price: number;
    installments: number;
    enableInstallmentPrice: boolean;
    payment_condition: string;
  };
  onInputChange: (field: string, value: string | number | boolean) => void;
}

export const PricingFormSection: React.FC<PricingFormSectionProps> = ({
  formData,
  onInputChange
}) => {
  const paymentMethods = [
    'À Vista',
    'Cartão de Crédito',
    'PIX',
    'Dinheiro',
    'Transferência',
    'Cartão de Débito'
  ];

  const formatCurrency = (value: number) => {
    // O valor já está em reais no formulário
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Preços e Condições</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cash_price" className="text-sm font-medium">
            Valor à Vista
          </Label>
          <Input
            id="cash_price"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.cash_price || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || value === '0') {
                onInputChange('cash_price', 0);
              } else {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue > 0) {
                  onInputChange('cash_price', numValue);
                }
              }
            }}
            placeholder="0,00"
            className="bg-background border-border"
          />
          {formData.cash_price > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(formData.cash_price)}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
          <Switch
            id="enable_installment_price"
            checked={formData.enableInstallmentPrice}
            onCheckedChange={(checked) => onInputChange('enableInstallmentPrice', checked)}
          />
          <Label htmlFor="enable_installment_price" className="text-sm font-medium">
            Ativar valor parcelado
          </Label>
        </div>

        {formData.enableInstallmentPrice && (
          <div className="space-y-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="space-y-2">
              <Label htmlFor="installment_price" className="text-sm font-medium">
                Valor Total Parcelado
              </Label>
              <Input
                id="installment_price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.installment_price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '0') {
                    onInputChange('installment_price', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue > 0) {
                      onInputChange('installment_price', numValue);
                    }
                  }
                }}
                placeholder="0,00"
                className="bg-background border-border"
              />
              {formData.installment_price > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.installment_price)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments" className="text-sm font-medium">
                Número de Parcelas
              </Label>
              <Select
                value={formData.installments.toString()}
                onValueChange={(value) => onInputChange('installments', parseInt(value))}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((installment) => (
                    <SelectItem key={installment} value={installment.toString()}>
                      {installment}x {formData.installment_price > 0 && 
                        `de ${formatCurrency(formData.installment_price / installment)}`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="payment_condition" className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Método de Pagamento
            </div>
          </Label>
          <Select
            value={formData.payment_condition}
            onValueChange={(value) => onInputChange('payment_condition', value)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};