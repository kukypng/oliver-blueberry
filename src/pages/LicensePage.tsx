import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Key, MessageCircle, AlertTriangle, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
export const LicensePage = () => {
  const [licenseCode, setLicenseCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const {
    user
  } = useAuth();
  const {
    showSuccess,
    showError
  } = useToast();
  const navigate = useNavigate();
  const handleActivateLicense = async () => {
    if (!licenseCode.trim()) {
      showError({
        title: 'Código Obrigatório',
        description: 'Por favor, insira um código de licença válido.'
      });
      return;
    }
    if (!user?.id) {
      showError({
        title: 'Erro de Autenticação',
        description: 'Usuário não encontrado. Faça login novamente.'
      });
      return;
    }

    // Validar formato do código
    if (!licenseCode.startsWith('344333') || licenseCode.length !== 13) {
      showError({
        title: 'Formato Inválido',
        description: 'O código deve começar com 344333 e ter 13 dígitos.'
      });
      return;
    }
    setIsActivating(true);
    try {
      const {
        data,
        error
      } = await supabase.rpc('activate_license_enhanced', {
        license_code: licenseCode.trim(),
        p_user_id: user.id
      });
      if (error) {
        throw error;
      }
      const result = data as any;
      if (result?.success) {
        showSuccess({
          title: 'Licença Ativada!',
          description: result.message || 'Sua licença foi ativada com sucesso.'
        });

        // Navegar para o dashboard após ativação
        setTimeout(() => {
          navigate('/painel');
        }, 2000);
      } else {
        const errorMessages = {
          'invalid_code': 'Código de licença inválido. Verifique e tente novamente.',
          'already_used': 'Esta licença já está sendo utilizada por outro usuário.',
          'expired': 'Esta licença está expirada. Entre em contato com o suporte.'
        };
        showError({
          title: 'Erro na Ativação',
          description: errorMessages[result?.error_type as keyof typeof errorMessages] || result?.error || 'Erro desconhecido.'
        });
      }
    } catch (error: any) {
      console.error('Error activating license:', error);
      showError({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro ao ativar a licença. Tente novamente.'
      });
    } finally {
      setIsActivating(false);
    }
  };
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Olá! Preciso de ajuda com minha licença do Oliver Blueberry.\n\nMeu email: ${user?.email || 'Não informado'}`);
    const whatsappUrl = `https://wa.me/556496028022?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  const handleEmailContact = () => {
    const subject = encodeURIComponent('Suporte - Licença Oliver Blueberry');
    const body = encodeURIComponent(`Olá,\n\nPreciso de ajuda com minha licença do Oliver Blueberry.\n\nMeu email: ${user?.email || 'Não informado'}\nData: ${new Date().toLocaleDateString('pt-BR')}`);
    window.open(`mailto:suporte@oliverblueberry.com?subject=${subject}&body=${body}`, '_blank');
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Header */}
        <div className="lg:col-span-2 text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Ativação de Licença</h1>
          <p className="text-muted-foreground">
            Ative sua licença para ter acesso completo ao Oliver Blueberry
          </p>
        </div>

        {/* License Activation Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Ativar Licença</CardTitle>
            <p className="text-sm text-muted-foreground">
              Digite seu código de licença para ativar sua conta
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="license-code" className="text-sm font-medium text-foreground">
                Código da Licença
              </label>
              <Input id="license-code" type="text" placeholder="XXXXXXXXXXXXX" value={licenseCode} onChange={e => setLicenseCode(e.target.value.replace(/\D/g, '').slice(0, 13))} className="font-mono text-center tracking-wider" maxLength={13} />
              <p className="text-xs text-muted-foreground text-center">
                Formato: XXXXXXXXXXXXX (13 dígitos)
              </p>
            </div>

            <Button onClick={handleActivateLicense} disabled={isActivating || licenseCode.length !== 13} className="w-full">
              {isActivating ? 'Ativando...' : 'Ativar Licença'}
            </Button>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Benefícios da Licença:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Acesso completo ao sistema por 30 dias</li>
                  <li>• Suporte técnico via WhatsApp</li>
                  <li>• Todas as funcionalidades liberadas</li>
                  <li>• Atualizações automáticas</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Suporte e Contato
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Nossa equipe está pronta para ajudar você
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WhatsApp */}
            <div className="space-y-3">
              <Button onClick={handleWhatsAppContact} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                Suporte via WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground">Resposta em até 1 hora (horário comercial)</p>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Outros Contatos:</h4>
              
              <Button onClick={handleEmailContact} variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                suporte@oliverblueberry.com
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(64) 9602-8022</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Goiânia, GO - Brasil</span>
              </div>
            </div>

            <Separator />

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="mr-1 h-3 w-3" />
                Suporte Ativo
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                Seguro
              </Badge>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Precisa de uma licença?</strong> Entre em contato via WhatsApp para adquirir ou renovar sua licença.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>;
};