import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calculator, Smartphone, Shield, Star, Activity } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/loading-states';
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Se o usuário estiver logado, redireciona para o painel (versão iOS principal)
  if (user) {
    return <Navigate to="/painel" replace />;
  }

  // Landing page para usuários não logados
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="glass border-b shadow-soft sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2 interactive-scale">
              <img alt="Oliver Logo" className="h-8 w-8" src="/lovable-uploads/logoo.png" />
              <h1 className="text-2xl font-bold text-foreground">Oliver</h1>
            </Link>
            <div className="flex items-center space-x-2">
              <Button asChild variant="outline" className="btn-apple-secondary interactive-scale">
                <Link to="/auth">Login</Link>
              </Button>
               <Button asChild className="btn-apple interactive-scale">
                
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 to-background"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
              Gerencie seus <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Orçamentos</span>
              <br />
              de forma profissional
            </h2>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
              Sistema completo para assistências técnicas gerenciarem orçamentos, 
              clientes e relatórios de forma eficiente e organizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-premium text-lg px-8 py-4">
                <Link to="/plans">Começar Agora</Link>
              </Button>
              <Button className="btn-mercadopago text-lg px-8 py-4" onClick={() => window.open('https://wa.me/556496028022', '_blank')}>
                Confirmar Pagamento
              </Button>
              <Button variant="outline" className="btn-apple-secondary text-lg px-8 py-4" onClick={() => window.open('https://wa.me/556496028022', '_blank')}>
                Entre em contato
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Funcionalidades Principais
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubra como nosso sistema pode transformar a gestão da sua assistência técnica
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            icon: FileText,
            title: "Orçamentos Detalhados",
            description: "Crie orçamentos profissionais com peças, serviços e condições de pagamento personalizadas."
          }, {
            icon: Smartphone,
            title: "Gestão de Dispositivos",
            description: "Cadastre diferentes tipos de dispositivos, marcas e defeitos para agilizar o atendimento."
          }, {
            icon: Star,
            title: "Preço Acessível",
            description: "Planos que cabem no seu bolso, focados na sua necessidade e sem surpresas."
          }, {
            icon: Activity,
            title: "Agilidade e Utilidade",
            description: "Ferramenta rápida e intuitiva, projetada para otimizar o dia a dia da sua assistência."
          }, {
            icon: Shield,
            title: "Segurança Avançada",
            description: "Controle de acesso por usuário com diferentes níveis de permissão e auditoria completa."
          }, {
            icon: Calculator,
            title: "Cálculos Automáticos",
            description: "Cálculo automático de totais, impostos e condições de pagamento personalizadas."
          }].map((feature, index) => {
            const Icon = feature.icon;
            return <Card key={index} className="glass-card group hover:shadow-strong transition-all duration-300 animate-scale-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>;
          })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-background"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
              Pronto para otimizar sua assistência técnica?
            </h3>
            <p className="text-lg lg:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Junte-se a centenas de profissionais que já utilizam o Oliver 
              para gerenciar seus negócios de forma mais eficiente.
            </p>
            <Button asChild className="btn-premium text-lg px-8 py-4">
              <Link to="/plans">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img alt="Oliver Logo" className="h-8 w-8" src="/lovable-uploads/logoo.png" />
              <span className="text-2xl font-bold text-foreground">Oliver</span>
            </div>
            <p className="text-muted-foreground mb-4">© 2025 Sistema profissional para gestão de orçamentos.</p>
            <p className="text-sm text-muted-foreground/80">
              Transformando a gestão de assistências técnicas através da tecnologia
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;