import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface BudgetCardErrorProps {
  error: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const BudgetCardError: React.FC<BudgetCardErrorProps> = ({
  error,
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/50">
      <div className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-red-900">Erro ao carregar orçamento</h3>
            <p className="text-sm text-red-700 max-w-sm">
              {error}
            </p>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Tentando...' : 'Tentar novamente'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};