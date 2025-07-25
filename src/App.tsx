import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { AuthPage } from "./pages/AuthPage";
import { SignUpPage } from "./pages/SignUpPage";
import { SignPage } from "./pages/SignPage";
import { PlansPage } from "./plans/PlansPage";
import { PurchaseSuccessPage } from "./pages/PurchaseSuccessPage";
import { DashboardLite } from "./pages/DashboardLite";
import { CookiePage } from "./pages/CookiePage";
import { IOSRedirectHandler } from "./components/IOSRedirectHandler";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import SecurityHeaders from "@/components/security/SecurityHeaders";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ResetEmailPage } from "./pages/ResetEmailPage";
import { VerifyPage } from "./pages/VerifyPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { LicensePage } from "./pages/LicensePage";
import { PWAProvider } from "./components/PWAProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <PWAProvider>
              <SecurityHeaders />
              <Toaster />
              <Sonner
                position="top-right"
                expand={false}
                richColors
                closeButton
                duration={4000}
                toastOptions={{
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
              <IOSRedirectHandler />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/licenca" element={<LicensePage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route
                  path="/reset-email"
                  element={
                    <ProtectedRoute>
                      <ResetEmailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={<SignUpPage />}
                />
                <Route
                  path="/sign"
                  element={<SignPage />}
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardLite />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/painel" 
                  element={
                    <ProtectedRoute>
                      <DashboardLite />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/budgets" 
                  element={
                    <ProtectedRoute>
                      <BudgetsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/cookie" element={<CookiePage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </PWAProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;