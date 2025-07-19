import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DevelopmentWarningProps {
  title?: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export const DevelopmentWarning = ({ 
  title = 'Funcionalidade em Desenvolvimento',
  message = 'Esta funcionalidade ainda está em desenvolvimento. Em breve estará disponível com melhorias completas.',
  onDismiss,
  className = ''
}: DevelopmentWarningProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`animate-fade-in ${className}`}>
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                {title}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                {message}
              </p>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};