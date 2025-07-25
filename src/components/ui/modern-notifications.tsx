/**
 * Modern Notifications - Apple/iOS Design System
 * Toast notifications, alerts e modals com animações premium
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIOSHaptic } from './animations-ios';

// Toast notification types
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast context
const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
});

// Toast provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast hook
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

// Individual toast item
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const { triggerHaptic } = useIOSHaptic();

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: 'border-success/20 bg-success/10 text-success-foreground',
      iconColor: 'text-success'
    },
    error: {
      icon: AlertCircle,
      className: 'border-destructive/20 bg-destructive/10 text-destructive-foreground',
      iconColor: 'text-destructive'
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-warning/20 bg-warning/10 text-warning-foreground',
      iconColor: 'text-warning'
    },
    info: {
      icon: Info,
      className: 'border-info/20 bg-info/10 text-info-foreground',
      iconColor: 'text-info'
    },
    default: {
      icon: Info,
      className: 'border-border bg-card text-card-foreground',
      iconColor: 'text-muted-foreground'
    }
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  const handleClose = () => {
    triggerHaptic('light');
    removeToast(toast.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      className={cn(
        "relative p-4 rounded-2xl border backdrop-blur-xl shadow-strong",
        config.className
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium text-primary hover:text-primary/80 mt-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-background/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Alert dialog
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'default' | 'destructive';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'default',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}) => {
  const { triggerHaptic } = useIOSHaptic();

  const handleConfirm = () => {
    triggerHaptic(type === 'destructive' ? 'error' : 'success');
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    triggerHaptic('light');
    onCancel?.();
    onClose();
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md mx-4"
          >
            <div className="bg-card border border-border/50 rounded-3xl shadow-xl p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 rounded-xl border border-border/50 text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl font-medium transition-colors",
                    type === 'destructive'
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Bottom sheet modal
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  const { triggerHaptic } = useIOSHaptic();

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[201] bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden",
              className
            )}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Title */}
            {title && (
              <div className="px-6 pb-4 border-b border-border/30">
                <h2 className="text-lg font-semibold text-center">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Floating notification (iOS-style banner)
interface FloatingNotificationProps {
  isVisible: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onTap?: () => void;
  onDismiss?: () => void;
  duration?: number;
}

export const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  isVisible,
  title,
  description,
  icon,
  onTap,
  onDismiss,
  duration = 4000
}) => {
  const { triggerHaptic } = useIOSHaptic();

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  const handleTap = () => {
    triggerHaptic('light');
    onTap?.();
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          className="fixed top-4 left-4 right-4 z-[100] mx-auto max-w-sm"
        >
          <div
            className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-4 cursor-pointer"
            onClick={handleTap}
          >
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="flex-shrink-0 text-primary">
                  {icon}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">{title}</h4>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>

              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onDismiss();
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};