import React, { useState } from 'react';
import { LifeBuoy, MessageCircle, Sparkles } from 'lucide-react';
import { IOSHelpSystem } from '@/components/help/IOSHelpSystem';
import { useIOSOptimization } from '@/hooks/useIOSOptimization';

export const DashboardLiteHelpSupport = () => {
  const [isHelpSystemOpen, setHelpSystemOpen] = useState(false);
  const { isIOS } = useIOSOptimization();

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/556496028022', '_blank');
  };

  return (
    <>
      <div className="bg-card border rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Central de Ajuda
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => setHelpSystemOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <LifeBuoy className="h-4 w-4" />
            Abrir Central de Ajuda
          </button>
          
          <button
            onClick={handleWhatsAppSupport}
            className="w-full bg-green-50 hover:bg-green-100 active:bg-green-200 dark:bg-green-950/20 dark:hover:bg-green-950/30 dark:active:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <MessageCircle className="h-4 w-4" />
            Suporte WhatsApp
          </button>
        </div>
      </div>

      <IOSHelpSystem 
        isOpen={isHelpSystemOpen} 
        onClose={() => setHelpSystemOpen(false)}
        initialContext="dashboard"
      />
    </>
  );
};