
import React, { useState } from 'react';
import { LifeBuoy, MessageCircle, Sparkles, BookOpen, Video, HelpCircle, ArrowRight } from 'lucide-react';
import { IOSHelpSystem } from '@/components/help/IOSHelpSystem';
import { useIOSOptimization } from '@/hooks/useIOSOptimization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const DashboardLiteHelpSupport = () => {
  const [isHelpSystemOpen, setHelpSystemOpen] = useState(false);
  const { isIOS } = useIOSOptimization();

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/556496028022', '_blank');
  };

  const quickHelpItems = [
    {
      id: 'create-budget',
      title: 'Como criar meu primeiro orçamento?',
      description: 'Passo a passo completo para criar orçamentos profissionais',
      icon: BookOpen,
      category: 'Tutorial'
    },
    {
      id: 'whatsapp-share',
      title: 'Como compartilhar via WhatsApp?',
      description: 'Envie orçamentos automaticamente para seus clientes',
      icon: MessageCircle,
      category: 'Básico'
    },
    {
      id: 'dashboard-guide',
      title: 'Entendendo o Dashboard',
      description: 'Aprenda a interpretar métricas e relatórios',
      icon: Video,
      category: 'Tutorial'
    }
  ];

  const handleQuickHelpClick = (itemId: string) => {
    setHelpSystemOpen(true);
    // Aqui você pode passar o contexto específico para o sistema de ajuda
  };

  return (
    <>
      <div className="space-y-4">
        {/* Central de Ajuda Principal */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Central de Ajuda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => setHelpSystemOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <LifeBuoy className="h-4 w-4" />
                Abrir Central de Ajuda
              </Button>
              
              <Button
                onClick={handleWhatsAppSupport}
                variant="outline"
                className="w-full bg-green-50 hover:bg-green-100 active:bg-green-200 dark:bg-green-950/20 dark:hover:bg-green-950/30 dark:active:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <MessageCircle className="h-4 w-4" />
                Suporte WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ajuda Rápida */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Ajuda Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickHelpItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleQuickHelpClick(item.id)}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 active:bg-muted/70 cursor-pointer transition-colors group"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </h4>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dicas Rápidas */}
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <h4 className="text-sm font-medium text-foreground">Dicas Rápidas</h4>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Use a busca para encontrar orçamentos rapidamente</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Personalize dados da empresa em Configurações</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Compartilhe orçamentos com um clique no WhatsApp</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IOSHelpSystem 
        isOpen={isHelpSystemOpen} 
        onClose={() => setHelpSystemOpen(false)}
        initialContext="dashboard"
      />
    </>
  );
};
