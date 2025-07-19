import React from 'react';

interface PlansHeroProps {
  logo: string;
  tituloPrincipal: string;
  subtituloPrincipal: string;
}

export const PlansHero = ({ logo, tituloPrincipal, subtituloPrincipal }: PlansHeroProps) => {
  return (
    <section className="text-center animate-fade-in-up">
      <div className="flex items-center justify-center space-x-3 mb-8">
        <img 
          alt="Oliver Logo" 
          className="h-16 w-16 interactive-scale" 
          src={logo}
          loading="lazy"
        />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Oliver
        </h1>
      </div>
      <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
        {tituloPrincipal}
      </h2>
      <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        {subtituloPrincipal}
      </p>
    </section>
  );
};