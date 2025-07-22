
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast, EnhancedToastOptions } from '@/hooks/useToast';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const useLicenseNotifications = () => {
  const { profile } = useAuth();
  const { showWarning, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.expiration_date) {
      return;
    }

    const expirationDate = parseISO(profile.expiration_date);
    const today = new Date();
    const remainingDays = differenceInDays(expirationDate, today);

    const handleGoToPlans = () => {
      navigate('/plans');
    };

    const notify = (key: string, level: 'warn' | 'error', options: EnhancedToastOptions) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const notificationKey = `license_notification_${key}_${todayStr}`;
      
      if (localStorage.getItem(notificationKey)) {
        return;
      }

      if (level === 'error') {
        showError(options);
      } else {
        showWarning(options);
      }
      localStorage.setItem(notificationKey, 'true');
    };

    const commonToastProps: Partial<EnhancedToastOptions> = {
      duration: 10000,
      action: {
        label: "Renovar Agora",
        onClick: handleGoToPlans,
      },
    };

    if (remainingDays >= 0 && remainingDays <= 1) {
      const dayText = remainingDays === 0 ? 'hoje' : 'em 1 dia';
      notify('1_day', 'error', {
        ...commonToastProps,
        title: `💔 Sua licença expira ${dayText}!`,
        description: 'Renove para não perder o acesso ao sistema.',
      });
    } else if (remainingDays > 1 && remainingDays <= 5) {
      notify('5_days', 'warn', {
        ...commonToastProps,
        title: `🍊 Sua licença expira em breve!`,
        description: `Faltam ${remainingDays} dias. Renove para continuar usando o sistema.`,
      });
    } else if (remainingDays > 5 && remainingDays <= 10) {
      notify('10_days', 'warn', {
        ...commonToastProps,
        title: `🍌 Atenção: Licença Expirando`,
        description: `Faltam ${remainingDays} dias para sua licença expirar.`,
        style: {
          backgroundColor: '#fec832',
          color: '#1f2937',
          borderColor: '#fca132',
        },
      });
    }
  }, [profile, showWarning, showError, navigate]);
};
