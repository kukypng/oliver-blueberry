import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface DadosPlano {
  nome: string;
  descricao: string;
  preco: number;
  moeda: string;
  periodo: string;
  badge_popular: string;
  mostrar_badge: boolean;
  botao_texto: string;
  mostrar_suporte: boolean;
  texto_suporte: string;
  informacoes_extras: string;
  beneficios: string[];
}

interface PlanCardProps {
  plano: DadosPlano;
  aoSelecionarPlano: () => void;
}

export const PlanCard = ({ plano, aoSelecionarPlano }: PlanCardProps) => {
  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="max-w-md mx-auto">
        <div className="relative bg-card border border-border rounded-3xl p-8 glass backdrop-blur-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
          
          {/* Badge Popular */}
          {plano.mostrar_badge && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                {plano.badge_popular}
              </span>
            </div>
          )}
          
          {/* Cabeçalho do Plano */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {plano.nome}
            </h3>
            <p className="text-muted-foreground mb-6">
              {plano.descricao}
            </p>
            
            {/* Preço */}
            <div className="flex items-baseline justify-center mb-6">
              <span className="text-5xl font-bold text-foreground">
                {plano.moeda}{plano.preco}
              </span>
              <span className="text-xl text-muted-foreground ml-1">
                {plano.periodo}
              </span>
            </div>
          </div>
          
          {/* Lista de Benefícios */}
          <div className="space-y-4 mb-8">
            {plano.beneficios.map((beneficio, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{beneficio}</span>
              </div>
            ))}
          </div>
          
          {/* Botão de Ação */}
          <Button 
            onClick={aoSelecionarPlano}
            className="w-full btn-premium text-lg py-4 mb-4"
          >
            {plano.botao_texto}
          </Button>
          
          {/* Informações de Suporte */}
          {plano.mostrar_suporte && (
            <p className="text-center text-sm text-muted-foreground mb-4">
              {plano.texto_suporte}
            </p>
          )}
          
          {/* Informações Extras */}
          <p className="text-center text-xs text-muted-foreground">
            {plano.informacoes_extras}
          </p>
        </div>
      </div>
    </section>
  );
};