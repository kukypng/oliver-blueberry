import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useIOSHaptic } from '@/components/ui/animations-ios';
import { usePWA } from '@/hooks/usePWA';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const PWAInstallButton: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installStep, setInstallStep] = useState<'prompt' | 'instructions'>('prompt');
  const { triggerHaptic } = useIOSHaptic();
  
  const { isDesktop } = useDeviceDetection();
  const { isInstalled, isInstallable, installApp } = usePWA();
  const device = useDeviceDetection();
  const { toast } = useToast();

  useEffect(() => {
    // Show install prompt after user engagement (only if not dismissed)
    if (!isInstalled && !isDesktop && !sessionStorage.getItem('pwa-install-dismissed')) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, device.isIOS ? 10000 : 5000); // Longer delay for iOS
      
      return () => clearTimeout(timer);
    }
  }, [isInstalled, isDesktop, device.isIOS]);

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    
    if (device.isIOS) {
      setInstallStep('instructions');
      return;
    }

    try {
      const success = await installApp();
      if (success) {
        triggerHaptic('success');
        setShowInstallPrompt(false);
        sessionStorage.setItem('pwa-installed', 'true');
        toast({
          title: "App Instalado!",
          description: "OneDrip foi instalado com sucesso.",
        });
      } else {
        triggerHaptic('error');
      }
    } catch (error) {
      triggerHaptic('error');
      console.error('Install failed:', error);
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    setShowInstallPrompt(false);
    setInstallStep('prompt');
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleBackToPrompt = () => {
    triggerHaptic('light');
    setInstallStep('prompt');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || isDesktop || sessionStorage.getItem('pwa-install-dismissed') || sessionStorage.getItem('pwa-installed')) {
    return null;
  }

  // Simple button version (for manual trigger)
  if (!showInstallPrompt) {
    const hasUserDismissedPopup = localStorage.getItem('pwa-install-dismissed') === 'true';
    
    if (!device.isIOS && !isInstallable && !hasUserDismissedPopup) {
      return null;
    }

    return (
      <EnhancedButton
        onClick={() => setShowInstallPrompt(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        haptic={true}
      >
        <Download className="h-4 w-4" />
        <span>Instalar App</span>
      </EnhancedButton>
    );
  }

  // Enhanced install prompt
  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            mass: 0.8
          }}
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm"
        >
          <motion.div
            className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {installStep === 'prompt' ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Smartphone className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Instalar App</h3>
                      <p className="text-xs text-muted-foreground">OneDrip PWA</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {device.isIOS 
                    ? "Adicione este app à sua tela inicial para acesso rápido e experiência nativa"
                    : "Instale este app para uma experiência mais rápida e recursos offline"
                  }
                </p>

                <div className="flex space-x-3">
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-1"
                    haptic={true}
                  >
                    Agora não
                  </EnhancedButton>
                  
                  <EnhancedButton
                    variant="premium"
                    size="sm"
                    onClick={handleInstallClick}
                    className="flex-1"
                    haptic={true}
                    animation="bounce"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {device.isIOS ? 'Como instalar' : 'Instalar'}
                  </EnhancedButton>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-foreground">Como Instalar</h3>
                  <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <motion.div
                    className="flex items-center space-x-3 p-3 bg-muted/30 rounded-2xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Share className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Toque no botão de compartilhar</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-3 p-3 bg-muted/30 rounded-2xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">2</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Selecione "Adicionar à Tela Inicial"</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-3 p-3 bg-success/10 rounded-2xl border border-success/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-success font-bold text-sm">3</span>
                    </div>
                    <span className="text-sm text-success-foreground">Pronto! O app estará na sua tela inicial</span>
                  </motion.div>
                </div>

                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={handleBackToPrompt}
                  className="w-full"
                  haptic={true}
                >
                  Entendi
                </EnhancedButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};