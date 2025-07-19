import React from 'react';
import { Star } from 'lucide-react';

interface Depoimento {
  nome: string;
  cargo: string;
  texto: string;
  nota: number;
}

interface TestimonialsSectionProps {
  mostrar: boolean;
  titulo: string;
  subtitulo: string;
  depoimentos: Depoimento[];
}

export const TestimonialsSection = ({ mostrar, titulo, subtitulo, depoimentos }: TestimonialsSectionProps) => {
  if (!mostrar) return null;

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="text-center mb-16">
        <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
          {titulo}
        </h3>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {subtitulo}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {depoimentos.map((depoimento, index) => (
          <div 
            key={index}
            className="bg-card border border-border rounded-2xl p-6 glass backdrop-blur-xl hover:scale-105 transition-all duration-300"
          >
            {/* Estrelas */}
            <div className="flex space-x-1 mb-4">
              {[...Array(depoimento.nota)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            
            {/* Texto do Depoimento */}
            <p className="text-foreground mb-4 italic">
              "{depoimento.texto}"
            </p>
            
            {/* Informações do Cliente */}
            <div className="border-t border-border pt-4">
              <p className="font-semibold text-foreground">
                {depoimento.nome}
              </p>
              <p className="text-sm text-muted-foreground">
                {depoimento.cargo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};