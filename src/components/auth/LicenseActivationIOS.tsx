import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Info, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

interface LicenseActivationIOSProps {
  user: any;
  onLicenseActivated: () => void;
}

export const LicenseActivationIOS = ({ user, onLicenseActivated }: LicenseActivationIOSProps) => {
  const [licenseCode, setLicenseCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [previewDays, setPreviewDays] = useState<number | null>(null);
  const { showSuccess, showError } = useToast();

  const validateLicenseFormat = (code: string) => {
    const regex = /^344333\d{7}$/;
    return regex.test(code);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 13) {
      setLicenseCode(value);
      
      if (validateLicenseFormat(value)) {
        setPreviewDays(30);
      } else {
        setPreviewDays(null);
      }
    }
  };

  const handleActivateLicense = async () => {
    if (!validateLicenseFormat(licenseCode)) {
      showError({
        title: 'Código Inválido',
        description: 'O código deve ter o formato: 344333XXXXXXX (13 dígitos)'
      });
      return;
    }

    setIsActivating(true);
    try {
      const { data, error } = await supabase.rpc('activate_license', {
        license_code: licenseCode.trim(),
        p_user_id: user.id
      });

      if (error) throw error;

      if ((data as any)?.success) {
        showSuccess({
          title: 'Licença Ativada!',
          description: 'Sua licença foi ativada com sucesso.'
        });
        setTimeout(() => {
          onLicenseActivated();
        }, 1500);
      } else {
        showError({
          title: 'Erro na Ativação',
          description: (data as any)?.error || 'Código de licença inválido ou já utilizado'
        });
      }
    } catch (error: any) {
      showError({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro ao ativar a licença. Tente novamente.'
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <Card className="border-amber-200 bg-amber-50/50 shadow-lg">
        <CardHeader className="pb-4 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-amber-100 p-3 rounded-full">
              <Key className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-amber-800 font-bold">
                Ative sua Licença
              </CardTitle>
              <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                Para acessar o sistema, você precisa ativar uma licença válida
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="license-code" className="text-sm font-medium text-amber-800 block">
              Código da Licença
            </label>
            <Input
              id="license-code"
              type="text"
              inputMode="numeric"
              placeholder="344333XXXXXXX"
              value={licenseCode}
              onChange={handleCodeChange}
              className="font-mono text-center tracking-wider border-amber-200 focus:border-amber-400 text-lg h-12"
              maxLength={13}
              style={{ 
                WebkitAppearance: 'none',
                fontSize: '16px' // Previne zoom no iOS
              }}
            />
            <p className="text-xs text-amber-600 text-center">
              Digite o código de 13 dígitos que inicia com 344333
            </p>
          </div>

          {previewDays && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Código Válido:</strong> Esta licença concederá {previewDays} dias de acesso
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm leading-relaxed">
              <strong>Importante:</strong> Cada código só pode ser usado uma vez. Certifique-se de digitar corretamente.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleActivateLicense}
            disabled={isActivating || !validateLicenseFormat(licenseCode)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-12 text-base"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActivating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ativando...</span>
              </div>
            ) : (
              'Ativar Licença'
            )}
          </Button>

          {!validateLicenseFormat(licenseCode) && licenseCode.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                Formato de código inválido. Use: 344333XXXXXXX
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};