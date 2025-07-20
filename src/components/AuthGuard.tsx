
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/pages/AuthPage';
import { LicensePage } from '@/pages/LicensePage';
import { useEnhancedLicenseValidation } from '@/hooks/useEnhancedLicenseValidation';
import { MobileLoading } from '@/components/ui/mobile-loading';
import { SecurityValidation } from '@/utils/securityValidation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, profile } = useAuth();
  const { data: licenseData, isLoading: licenseLoading } = useEnhancedLicenseValidation();

  if (loading || licenseLoading) {
    return <MobileLoading message="Verificando autenticação..." />;
  }

  if (!user) {
    return <AuthPage />;
  }

  // Check if email is verified com validação adicional de segurança
  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-4">🔒 Confirme seu e-mail</h2>
          <p className="text-muted-foreground text-center mb-4">
            Por segurança, você precisa confirmar seu e-mail antes de acessar o sistema.
            Verifique sua caixa de entrada e clique no link de confirmação.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <p className="text-amber-800 text-sm">
              <strong>Medida de Segurança:</strong> Esta verificação protege sua conta e os dados do sistema.
            </p>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Já confirmei
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check license validity after user is authenticated
  if (!licenseData?.is_valid) {
    return <LicensePage />;
  }

  return <>{children}</>;
};
