import React from 'react';
import { Settings, Truck, Shield, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface SettingsFormSectionProps {
  formData: {
    includes_delivery: boolean;
    includes_screen_protector: boolean;
    observations: string;
  };
  onInputChange: (field: string, value: string | boolean) => void;
}

export const SettingsFormSection: React.FC<SettingsFormSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Configurações Adicionais</h3>
      </div>

      <div className="space-y-4">
        {/* Serviços Adicionais */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Serviços Adicionais</Label>
          
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="includes_delivery"
                checked={formData.includes_delivery}
                onCheckedChange={(checked) => onInputChange('includes_delivery', !!checked)}
              />
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="includes_delivery" className="text-sm">
                  Incluir busca e entrega
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="includes_screen_protector"
                checked={formData.includes_screen_protector}
                onCheckedChange={(checked) => onInputChange('includes_screen_protector', !!checked)}
              />
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="includes_screen_protector" className="text-sm">
                  Incluir película 3D de brinde
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observations" className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </div>
          </Label>
          <Textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => onInputChange('observations', e.target.value)}
            placeholder="Observações adicionais sobre o orçamento..."
            rows={4}
            className="bg-background border-border resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {formData.observations.length}/500 caracteres
          </p>
        </div>
      </div>
    </div>
  );
};