import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Search, 
  MessageCircle, 
  Star, 
  Video, 
  FileText,
  Lightbulb,
  HelpCircle,
  Filter,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { HelpSearchBar } from './HelpSearchBar';
import { ContextualHelp } from './ContextualHelp';
import { TutorialOverlay } from './TutorialOverlay';
import { FeedbackForm } from './FeedbackForm';
import { useHelpSystem, HelpContent } from '@/hooks/useHelpSystem';
import { cn } from '@/lib/utils';

// Função utilitária para busca fuzzy simples
function fuzzyIncludes(text: string, query: string) {
  if (!query) return true;
  const normalizedText = text.normalize('NFD').replace(/[ \u0300-\u036f]/g, '').toLowerCase();
  const normalizedQuery = query.normalize('NFD').replace(/[ \u0300-\u036f]/g, '').toLowerCase();
  // Permite até 1 erro de digitação (Levenshtein <= 1) para buscas curtas
  if (normalizedQuery.length <= 4) {
    return normalizedText.includes(normalizedQuery);
  }
  // Busca fuzzy simples: todas as letras do query aparecem na ordem
  let i = 0;
  for (let c of normalizedText) {
    if (c === normalizedQuery[i]) i++;
    if (i === normalizedQuery.length) return true;
  }
  return false;
}

// Função para destacar termos encontrados
function highlight(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-primary px-1 rounded">{part}</mark> : part
  );
}

// Base de conhecimento completa
const knowledgeBase: HelpContent[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos no Sistema',
    description: 'Guia completo para começar a usar todas as funcionalidades.',
    category: 'tutorial',
    tags: ['início', 'básico', 'configuração'],
    icon: 'BookOpen',
    steps: [
      {
        title: 'Bem-vindo!',
        description: 'Vamos configurar sua conta e criar seu primeiro orçamento.',
        position: 'bottom'
      },
      {
        title: 'Configure sua Empresa',
        description: 'Adicione as informações da sua empresa que aparecerão nos orçamentos.',
        target: '[data-help="company-settings"]',
        position: 'right'
      },
      {
        title: 'Crie seu Primeiro Orçamento',
        description: 'Agora vamos criar um orçamento completo.',
        target: '[data-help="new-budget"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'dashboard-overview',
    title: 'Entendendo o Dashboard',
    description: 'Como interpretar as métricas e usar as funcionalidades do painel.',
    category: 'basic',
    tags: ['dashboard', 'métricas', 'relatórios'],
    icon: 'BarChart2'
  },
  {
    id: 'budget-management',
    title: 'Gestão Completa de Orçamentos',
    description: 'Criar, editar, compartilhar e organizar orçamentos eficientemente.',
    category: 'basic',
    tags: ['orçamentos', 'gestão', 'compartilhamento'],
    icon: 'FileText'
  },
  {
    id: 'whatsapp-integration',
    title: 'Integração com WhatsApp',
    description: 'Como usar a funcionalidade de compartilhamento automático.',
    category: 'advanced',
    tags: ['whatsapp', 'compartilhamento', 'automação'],
    icon: 'MessageCircle'
  },
  {
    id: 'shortcuts-tips',
    title: 'Atalhos e Dicas de Produtividade',
    description: 'Acelere seu trabalho com atalhos e funcionalidades avançadas.',
    category: 'tips',
    tags: ['produtividade', 'atalhos', 'eficiência'],
    icon: 'Zap'
  }
];

const faqs = [
  {
    question: 'Como criar meu primeiro orçamento?',
    answer: 'Acesse "Novo Orçamento" no menu, preencha os dados do cliente e dispositivo, adicione os serviços e valores desejados.',
    tags: ['orçamento', 'criar', 'primeiro']
  },
  {
    question: 'Como compartilhar orçamentos via WhatsApp?',
    answer: 'Na lista de orçamentos, clique no botão do WhatsApp ao lado do orçamento desejado. O link será enviado automaticamente.',
    tags: ['whatsapp', 'compartilhar']
  },
  {
    question: 'Como personalizar informações da empresa?',
    answer: 'Vá em Configurações > Dados da Empresa e preencha suas informações. Elas aparecerão automaticamente em todos os orçamentos.',
    tags: ['empresa', 'personalizar', 'configurações']
  },
  {
    question: 'O que significam os status dos orçamentos?',
    answer: 'Pendente (aguardando resposta), Aprovado (cliente aceitou), Rejeitado (cliente recusou), Concluído (serviço finalizado).',
    tags: ['status', 'orçamentos', 'fluxo']
  },
  {
    question: 'Como acompanhar o faturamento?',
    answer: 'No Dashboard você vê o resumo do mês atual. Para relatórios detalhados, use a seção de Gestão de Dados.',
    tags: ['faturamento', 'dashboard', 'relatórios']
  }
];

const searchSuggestions = [
  'Como criar orçamento',
  'Compartilhar WhatsApp',
  'Configurar empresa',
  'Status dos orçamentos',
  'Backup de dados',
  'Atalhos do teclado',
  'Problemas de login',
  'Exportar relatórios'
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const HelpSystem = ({ isOpen, onClose, initialContext }: HelpSystemProps) => {
  const {
    searchQuery,
    activeCategory,
    showTutorial,
    tutorialStep,
    currentContent,
    setSearchQuery,
    setActiveCategory,
    startTutorial,
    nextTutorialStep,
    prevTutorialStep,
    finishTutorial,
    getContextualHelp
  } = useHelpSystem();

  const [activeTab, setActiveTab] = useState('contextual');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedContent, setSelectedContent] = useState<HelpContent | null>(null);

  const context = initialContext || getContextualHelp();

  // Filtrar conteúdo baseado na busca e categoria
  const filteredContent = knowledgeBase.filter(content => {
    const matchesSearch = !searchQuery || 
      fuzzyIncludes(content.title, searchQuery) ||
      fuzzyIncludes(content.description, searchQuery) ||
      content.tags.some(tag => fuzzyIncludes(tag, searchQuery));
    const matchesCategory = !activeCategory || content.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    return !searchQuery || 
      fuzzyIncludes(faq.question, searchQuery) ||
      fuzzyIncludes(faq.answer, searchQuery) ||
      faq.tags.some(tag => fuzzyIncludes(tag, searchQuery));
  });

  const categories = [
    { id: 'basic', label: 'Básico', count: knowledgeBase.filter(c => c.category === 'basic').length },
    { id: 'tutorial', label: 'Tutoriais', count: knowledgeBase.filter(c => c.category === 'tutorial').length },
    { id: 'advanced', label: 'Avançado', count: knowledgeBase.filter(c => c.category === 'advanced').length },
    { id: 'tips', label: 'Dicas', count: knowledgeBase.filter(c => c.category === 'tips').length },
    { id: 'faq', label: 'FAQ', count: faqs.length }
  ];

  const handleContentSelect = (content: HelpContent) => {
    setSelectedContent(content);
    if (content.steps && content.steps.length > 0) {
      startTutorial(content);
    }
  };

  const handleStartTutorial = () => {
    const tutorialContent = knowledgeBase.find(c => c.id === 'getting-started');
    if (tutorialContent) {
      startTutorial(tutorialContent);
      onClose(); // Fechar dialog para mostrar tutorial
    }
  };

  // Atalho de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open help from parent
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent role="dialog" aria-modal="true" className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              Central de Ajuda
              <Badge variant="secondary" className="text-xs">
                Ctrl+H
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            {/* Barra de busca */}
            <div className="mb-6">
              <HelpSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={searchSuggestions}
                placeholder="Buscar ajuda, tutoriais, FAQ..."
                autoFocus
              />
            </div>

            {/* Conteúdo principal */}
            {showFeedback ? (
              <FeedbackForm 
                onClose={() => setShowFeedback(false)} 
                context={context}
              />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="contextual" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Contextual
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Guias
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="support" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Suporte
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contextual" className="space-y-6">
                  <ContextualHelp
                    context={context}
                    onContentSelect={handleContentSelect}
                    onStartTutorial={handleStartTutorial}
                  />
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-6">
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeCategory ? "outline" : "default"}
                      size="sm"
                      onClick={() => setActiveCategory(null)}
                      className="gap-2"
                    >
                      <Filter className="h-3 w-3" />
                      Todos
                    </Button>
                    {categories.filter(c => c.id !== 'faq').map(category => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                        className="gap-2"
                      >
                        {category.label}
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* Lista de conteúdo */}
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredContent.map(content => (
                        <Card 
                          key={content.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleContentSelect(content)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{highlight(content.title, searchQuery)}</h3>
                                  <Badge 
                                    variant={content.category === 'tutorial' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {content.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {highlight(content.description, searchQuery)}
                                </p>
                                <div className="flex gap-1">
                                  {content.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground ml-4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredFAQs.map((faq, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{highlight(faq.question, searchQuery)}</h3>
                            <p className="text-sm text-muted-foreground">{highlight(faq.answer, searchQuery)}</p>
                            <div className="flex gap-1 mt-2">
                              {faq.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Suporte Direto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={() => window.open('https://wa.me/556496028022', '_blank')}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Suporte
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          onClick={() => setShowFeedback(true)}
                          className="w-full gap-2"
                          aria-label="Enviar Feedback"
                        >
                          <Star className="h-4 w-4" />
                          Enviar Feedback
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        content={currentContent}
        currentStep={tutorialStep}
        onNext={nextTutorialStep}
        onPrev={prevTutorialStep}
        onClose={finishTutorial}
        onComplete={finishTutorial}
      />
    </>
  );
};

const knowledgeBase: HelpContent[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos no Sistema',
    description: 'Guia completo para começar a usar todas as funcionalidades.',
    category: 'tutorial',
    tags: ['início', 'básico', 'configuração'],
    icon: 'BookOpen',
    steps: [
      {
        title: 'Bem-vindo!',
        description: 'Vamos configurar sua conta e criar seu primeiro orçamento.',
        position: 'bottom'
      },
      {
        title: 'Configure sua Empresa',
        description: 'Adicione as informações da sua empresa que aparecerão nos orçamentos.',
        target: '[data-help="company-settings"]',
        position: 'right'
      },
      {
        title: 'Crie seu Primeiro Orçamento',
        description: 'Agora vamos criar um orçamento completo.',
        target: '[data-help="new-budget"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'dashboard-overview',
    title: 'Entendendo o Dashboard',
    description: 'Como interpretar as métricas e usar as funcionalidades do painel.',
    category: 'basic',
    tags: ['dashboard', 'métricas', 'relatórios'],
    icon: 'BarChart2'
  },
  {
    id: 'budget-management',
    title: 'Gestão Completa de Orçamentos',
    description: 'Criar, editar, compartilhar e organizar orçamentos eficientemente.',
    category: 'basic',
    tags: ['orçamentos', 'gestão', 'compartilhamento'],
    icon: 'FileText'
  },
  {
    id: 'whatsapp-integration',
    title: 'Integração com WhatsApp',
    description: 'Como usar a funcionalidade de compartilhamento automático.',
    category: 'advanced',
    tags: ['whatsapp', 'compartilhamento', 'automação'],
    icon: 'MessageCircle'
  },
  {
    id: 'shortcuts-tips',
    title: 'Atalhos e Dicas de Produtividade',
    description: 'Acelere seu trabalho com atalhos e funcionalidades avançadas.',
    category: 'tips',
    tags: ['produtividade', 'atalhos', 'eficiência'],
    icon: 'Zap'
  }
];

const faqs = [
  {
    question: 'Como criar meu primeiro orçamento?',
    answer: 'Acesse "Novo Orçamento" no menu, preencha os dados do cliente e dispositivo, adicione os serviços e valores desejados.',
    tags: ['orçamento', 'criar', 'primeiro']
  },
  {
    question: 'Como compartilhar orçamentos via WhatsApp?',
    answer: 'Na lista de orçamentos, clique no botão do WhatsApp ao lado do orçamento desejado. O link será enviado automaticamente.',
    tags: ['whatsapp', 'compartilhar']
  },
  {
    question: 'Como personalizar informações da empresa?',
    answer: 'Vá em Configurações > Dados da Empresa e preencha suas informações. Elas aparecerão automaticamente em todos os orçamentos.',
    tags: ['empresa', 'personalizar', 'configurações']
  },
  {
    question: 'O que significam os status dos orçamentos?',
    answer: 'Pendente (aguardando resposta), Aprovado (cliente aceitou), Rejeitado (cliente recusou), Concluído (serviço finalizado).',
    tags: ['status', 'orçamentos', 'fluxo']
  },
  {
    question: 'Como acompanhar o faturamento?',
    answer: 'No Dashboard você vê o resumo do mês atual. Para relatórios detalhados, use a seção de Gestão de Dados.',
    tags: ['faturamento', 'dashboard', 'relatórios']
  }
];

const searchSuggestions = [
  'Como criar orçamento',
  'Compartilhar WhatsApp',
  'Configurar empresa',
  'Status dos orçamentos',
  'Backup de dados',
  'Atalhos do teclado',
  'Problemas de login',
  'Exportar relatórios'
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const HelpSystem = ({ isOpen, onClose, initialContext }: HelpSystemProps) => {
  const {
    searchQuery,
    activeCategory,
    showTutorial,
    tutorialStep,
    currentContent,
    setSearchQuery,
    setActiveCategory,
    startTutorial,
    nextTutorialStep,
    prevTutorialStep,
    finishTutorial,
    getContextualHelp
  } = useHelpSystem();

  const [activeTab, setActiveTab] = useState('contextual');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedContent, setSelectedContent] = useState<HelpContent | null>(null);

  const context = initialContext || getContextualHelp();

  // Filtrar conteúdo baseado na busca e categoria
  const filteredContent = knowledgeBase.filter(content => {
    const matchesSearch = !searchQuery || 
      fuzzyIncludes(content.title, searchQuery) ||
      fuzzyIncludes(content.description, searchQuery) ||
      content.tags.some(tag => fuzzyIncludes(tag, searchQuery));
    const matchesCategory = !activeCategory || content.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    return !searchQuery || 
      fuzzyIncludes(faq.question, searchQuery) ||
      fuzzyIncludes(faq.answer, searchQuery) ||
      faq.tags.some(tag => fuzzyIncludes(tag, searchQuery));
  });

  const categories = [
    { id: 'basic', label: 'Básico', count: knowledgeBase.filter(c => c.category === 'basic').length },
    { id: 'tutorial', label: 'Tutoriais', count: knowledgeBase.filter(c => c.category === 'tutorial').length },
    { id: 'advanced', label: 'Avançado', count: knowledgeBase.filter(c => c.category === 'advanced').length },
    { id: 'tips', label: 'Dicas', count: knowledgeBase.filter(c => c.category === 'tips').length },
    { id: 'faq', label: 'FAQ', count: faqs.length }
  ];

  const handleContentSelect = (content: HelpContent) => {
    setSelectedContent(content);
    if (content.steps && content.steps.length > 0) {
      startTutorial(content);
    }
  };

  const handleStartTutorial = () => {
    const tutorialContent = knowledgeBase.find(c => c.id === 'getting-started');
    if (tutorialContent) {
      startTutorial(tutorialContent);
      onClose(); // Fechar dialog para mostrar tutorial
    }
  };

  // Atalho de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open help from parent
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent role="dialog" aria-modal="true" className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              Central de Ajuda
              <Badge variant="secondary" className="text-xs">
                Ctrl+H
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            {/* Barra de busca */}
            <div className="mb-6">
              <HelpSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={searchSuggestions}
                placeholder="Buscar ajuda, tutoriais, FAQ..."
                autoFocus
              />
            </div>

            {/* Conteúdo principal */}
            {showFeedback ? (
              <FeedbackForm 
                onClose={() => setShowFeedback(false)} 
                context={context}
              />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="contextual" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Contextual
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Guias
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="support" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Suporte
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contextual" className="space-y-6">
                  <ContextualHelp
                    context={context}
                    onContentSelect={handleContentSelect}
                    onStartTutorial={handleStartTutorial}
                  />
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-6">
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeCategory ? "outline" : "default"}
                      size="sm"
                      onClick={() => setActiveCategory(null)}
                      className="gap-2"
                    >
                      <Filter className="h-3 w-3" />
                      Todos
                    </Button>
                    {categories.filter(c => c.id !== 'faq').map(category => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                        className="gap-2"
                      >
                        {category.label}
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* Lista de conteúdo */}
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredContent.map(content => (
                        <Card 
                          key={content.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleContentSelect(content)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{highlight(content.title, searchQuery)}</h3>
                                  <Badge 
                                    variant={content.category === 'tutorial' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {content.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {highlight(content.description, searchQuery)}
                                </p>
                                <div className="flex gap-1">
                                  {content.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground ml-4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredFAQs.map((faq, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{highlight(faq.question, searchQuery)}</h3>
                            <p className="text-sm text-muted-foreground">{highlight(faq.answer, searchQuery)}</p>
                            <div className="flex gap-1 mt-2">
                              {faq.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Suporte Direto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={() => window.open('https://wa.me/556496028022', '_blank')}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Suporte
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          onClick={() => setShowFeedback(true)}
                          className="w-full gap-2"
                          aria-label="Enviar Feedback"
                        >
                          <Star className="h-4 w-4" />
                          Enviar Feedback
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        content={currentContent}
        currentStep={tutorialStep}
        onNext={nextTutorialStep}
        onPrev={prevTutorialStep}
        onClose={finishTutorial}
        onComplete={finishTutorial}
      />
    </>
  );
};
const knowledgeBase: HelpContent[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos no Sistema',
    description: 'Guia completo para começar a usar todas as funcionalidades.',
    category: 'tutorial',
    tags: ['início', 'básico', 'configuração'],
    icon: 'BookOpen',
    steps: [
      {
        title: 'Bem-vindo!',
        description: 'Vamos configurar sua conta e criar seu primeiro orçamento.',
        position: 'bottom'
      },
      {
        title: 'Configure sua Empresa',
        description: 'Adicione as informações da sua empresa que aparecerão nos orçamentos.',
        target: '[data-help="company-settings"]',
        position: 'right'
      },
      {
        title: 'Crie seu Primeiro Orçamento',
        description: 'Agora vamos criar um orçamento completo.',
        target: '[data-help="new-budget"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'dashboard-overview',
    title: 'Entendendo o Dashboard',
    description: 'Como interpretar as métricas e usar as funcionalidades do painel.',
    category: 'basic',
    tags: ['dashboard', 'métricas', 'relatórios'],
    icon: 'BarChart2'
  },
  {
    id: 'budget-management',
    title: 'Gestão Completa de Orçamentos',
    description: 'Criar, editar, compartilhar e organizar orçamentos eficientemente.',
    category: 'basic',
    tags: ['orçamentos', 'gestão', 'compartilhamento'],
    icon: 'FileText'
  },
  {
    id: 'whatsapp-integration',
    title: 'Integração com WhatsApp',
    description: 'Como usar a funcionalidade de compartilhamento automático.',
    category: 'advanced',
    tags: ['whatsapp', 'compartilhamento', 'automação'],
    icon: 'MessageCircle'
  },
  {
    id: 'shortcuts-tips',
    title: 'Atalhos e Dicas de Produtividade',
    description: 'Acelere seu trabalho com atalhos e funcionalidades avançadas.',
    category: 'tips',
    tags: ['produtividade', 'atalhos', 'eficiência'],
    icon: 'Zap'
  }
];

const faqs = [
  {
    question: 'Como criar meu primeiro orçamento?',
    answer: 'Acesse "Novo Orçamento" no menu, preencha os dados do cliente e dispositivo, adicione os serviços e valores desejados.',
    tags: ['orçamento', 'criar', 'primeiro']
  },
  {
    question: 'Como compartilhar orçamentos via WhatsApp?',
    answer: 'Na lista de orçamentos, clique no botão do WhatsApp ao lado do orçamento desejado. O link será enviado automaticamente.',
    tags: ['whatsapp', 'compartilhar']
  },
  {
    question: 'Como personalizar informações da empresa?',
    answer: 'Vá em Configurações > Dados da Empresa e preencha suas informações. Elas aparecerão automaticamente em todos os orçamentos.',
    tags: ['empresa', 'personalizar', 'configurações']
  },
  {
    question: 'O que significam os status dos orçamentos?',
    answer: 'Pendente (aguardando resposta), Aprovado (cliente aceitou), Rejeitado (cliente recusou), Concluído (serviço finalizado).',
    tags: ['status', 'orçamentos', 'fluxo']
  },
  {
    question: 'Como acompanhar o faturamento?',
    answer: 'No Dashboard você vê o resumo do mês atual. Para relatórios detalhados, use a seção de Gestão de Dados.',
    tags: ['faturamento', 'dashboard', 'relatórios']
  }
];

const searchSuggestions = [
  'Como criar orçamento',
  'Compartilhar WhatsApp',
  'Configurar empresa',
  'Status dos orçamentos',
  'Backup de dados',
  'Atalhos do teclado',
  'Problemas de login',
  'Exportar relatórios'
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const HelpSystem = ({ isOpen, onClose, initialContext }: HelpSystemProps) => {
  const {
    searchQuery,
    activeCategory,
    showTutorial,
    tutorialStep,
    currentContent,
    setSearchQuery,
    setActiveCategory,
    startTutorial,
    nextTutorialStep,
    prevTutorialStep,
    finishTutorial,
    getContextualHelp
  } = useHelpSystem();

  const [activeTab, setActiveTab] = useState('contextual');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedContent, setSelectedContent] = useState<HelpContent | null>(null);

  const context = initialContext || getContextualHelp();

  // Filtrar conteúdo baseado na busca e categoria
  const filteredContent = knowledgeBase.filter(content => {
    const matchesSearch = !searchQuery || 
      fuzzyIncludes(content.title, searchQuery) ||
      fuzzyIncludes(content.description, searchQuery) ||
      content.tags.some(tag => fuzzyIncludes(tag, searchQuery));
    const matchesCategory = !activeCategory || content.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    return !searchQuery || 
      fuzzyIncludes(faq.question, searchQuery) ||
      fuzzyIncludes(faq.answer, searchQuery) ||
      faq.tags.some(tag => fuzzyIncludes(tag, searchQuery));
  });

  const categories = [
    { id: 'basic', label: 'Básico', count: knowledgeBase.filter(c => c.category === 'basic').length },
    { id: 'tutorial', label: 'Tutoriais', count: knowledgeBase.filter(c => c.category === 'tutorial').length },
    { id: 'advanced', label: 'Avançado', count: knowledgeBase.filter(c => c.category === 'advanced').length },
    { id: 'tips', label: 'Dicas', count: knowledgeBase.filter(c => c.category === 'tips').length },
    { id: 'faq', label: 'FAQ', count: faqs.length }
  ];

  const handleContentSelect = (content: HelpContent) => {
    setSelectedContent(content);
    if (content.steps && content.steps.length > 0) {
      startTutorial(content);
    }
  };

  const handleStartTutorial = () => {
    const tutorialContent = knowledgeBase.find(c => c.id === 'getting-started');
    if (tutorialContent) {
      startTutorial(tutorialContent);
      onClose(); // Fechar dialog para mostrar tutorial
    }
  };

  // Atalho de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open help from parent
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent role="dialog" aria-modal="true" className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              Central de Ajuda
              <Badge variant="secondary" className="text-xs">
                Ctrl+H
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            {/* Barra de busca */}
            <div className="mb-6">
              <HelpSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={searchSuggestions}
                placeholder="Buscar ajuda, tutoriais, FAQ..."
                autoFocus
              />
            </div>

            {/* Conteúdo principal */}
            {showFeedback ? (
              <FeedbackForm 
                onClose={() => setShowFeedback(false)} 
                context={context}
              />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="contextual" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Contextual
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Guias
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="support" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Suporte
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contextual" className="space-y-6">
                  <ContextualHelp
                    context={context}
                    onContentSelect={handleContentSelect}
                    onStartTutorial={handleStartTutorial}
                  />
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-6">
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeCategory ? "outline" : "default"}
                      size="sm"
                      onClick={() => setActiveCategory(null)}
                      className="gap-2"
                    >
                      <Filter className="h-3 w-3" />
                      Todos
                    </Button>
                    {categories.filter(c => c.id !== 'faq').map(category => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                        className="gap-2"
                      >
                        {category.label}
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* Lista de conteúdo */}
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredContent.map(content => (
                        <Card 
                          key={content.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleContentSelect(content)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{highlight(content.title, searchQuery)}</h3>
                                  <Badge 
                                    variant={content.category === 'tutorial' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {content.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {highlight(content.description, searchQuery)}
                                </p>
                                <div className="flex gap-1">
                                  {content.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground ml-4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredFAQs.map((faq, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{highlight(faq.question, searchQuery)}</h3>
                            <p className="text-sm text-muted-foreground">{highlight(faq.answer, searchQuery)}</p>
                            <div className="flex gap-1 mt-2">
                              {faq.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Suporte Direto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={() => window.open('https://wa.me/556496028022', '_blank')}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Suporte
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          onClick={() => setShowFeedback(true)}
                          className="w-full gap-2"
                          aria-label="Enviar Feedback"
                        >
                          <Star className="h-4 w-4" />
                          Enviar Feedback
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        content={currentContent}
        currentStep={tutorialStep}
        onNext={nextTutorialStep}
        onPrev={prevTutorialStep}
        onClose={finishTutorial}
        onComplete={finishTutorial}
      />
    </>
  );
};
const knowledgeBase: HelpContent[] = [
  {
    id: 'dashboard-navigation',
    title: 'Navegação no Dashboard',
    description: 'Aprenda a usar o dashboard principal para acessar rapidamente funcionalidades chave.',
    category: 'basic',
    tags: ['dashboard', 'navegação', 'início'],
    steps: [
      { title: 'Visão Geral', description: 'Aqui você vê estatísticas principais.' },
      { title: 'Acesso Rápido', description: 'Botões para criar orçamentos e gerenciar.' }
    ]
  },
  {
    id: 'budget-creation',
    title: 'Criando Orçamentos',
    description: 'Guia passo a passo para criar e gerenciar orçamentos.',
    category: 'tutorial',
    tags: ['orçamentos', 'criação', 'gestão'],
    steps: [
      { title: 'Novo Orçamento', description: 'Clique no botão + para começar.' },
      { title: 'Preencha Dados', description: 'Adicione cliente, serviços e valores.' },
      { title: 'Salve e Compartilhe', description: 'Salve e envie via WhatsApp.' }
    ]
  },
  // Adicione mais conteúdos simples e úteis aqui
];

const faqs = [
  {
    question: 'Como criar meu primeiro orçamento?',
    answer: 'Acesse "Novo Orçamento" no menu, preencha os dados do cliente e dispositivo, adicione os serviços e valores desejados.',
    tags: ['orçamento', 'criar', 'primeiro']
  },
  {
    question: 'Como compartilhar orçamentos via WhatsApp?',
    answer: 'Na lista de orçamentos, clique no botão do WhatsApp ao lado do orçamento desejado. O link será enviado automaticamente.',
    tags: ['whatsapp', 'compartilhar']
  },
  {
    question: 'Como personalizar informações da empresa?',
    answer: 'Vá em Configurações > Dados da Empresa e preencha suas informações. Elas aparecerão automaticamente em todos os orçamentos.',
    tags: ['empresa', 'personalizar', 'configurações']
  },
  {
    question: 'O que significam os status dos orçamentos?',
    answer: 'Pendente (aguardando resposta), Aprovado (cliente aceitou), Rejeitado (cliente recusou), Concluído (serviço finalizado).',
    tags: ['status', 'orçamentos', 'fluxo']
  },
  {
    question: 'Como acompanhar o faturamento?',
    answer: 'No Dashboard você vê o resumo do mês atual. Para relatórios detalhados, use a seção de Gestão de Dados.',
    tags: ['faturamento', 'dashboard', 'relatórios']
  }
];

const searchSuggestions = [
  'Como criar orçamento',
  'Compartilhar WhatsApp',
  'Configurar empresa',
  'Status dos orçamentos',
  'Backup de dados',
  'Atalhos do teclado',
  'Problemas de login',
  'Exportar relatórios'
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const HelpSystem = ({ isOpen, onClose, initialContext }: HelpSystemProps) => {
  const {
    searchQuery,
    activeCategory,
    showTutorial,
    tutorialStep,
    currentContent,
    setSearchQuery,
    setActiveCategory,
    startTutorial,
    nextTutorialStep,
    prevTutorialStep,
    finishTutorial,
    getContextualHelp
  } = useHelpSystem();

  const [activeTab, setActiveTab] = useState('contextual');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedContent, setSelectedContent] = useState<HelpContent | null>(null);

  const context = initialContext || getContextualHelp();

  // Filtrar conteúdo baseado na busca e categoria
  const filteredContent = knowledgeBase.filter(content => {
    const matchesSearch = !searchQuery || 
      fuzzyIncludes(content.title, searchQuery) ||
      fuzzyIncludes(content.description, searchQuery) ||
      content.tags.some(tag => fuzzyIncludes(tag, searchQuery));
    const matchesCategory = !activeCategory || content.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    return !searchQuery || 
      fuzzyIncludes(faq.question, searchQuery) ||
      fuzzyIncludes(faq.answer, searchQuery) ||
      faq.tags.some(tag => fuzzyIncludes(tag, searchQuery));
  });

  const categories = [
    { id: 'basic', label: 'Básico', count: knowledgeBase.filter(c => c.category === 'basic').length },
    { id: 'tutorial', label: 'Tutoriais', count: knowledgeBase.filter(c => c.category === 'tutorial').length },
    { id: 'advanced', label: 'Avançado', count: knowledgeBase.filter(c => c.category === 'advanced').length },
    { id: 'tips', label: 'Dicas', count: knowledgeBase.filter(c => c.category === 'tips').length },
    { id: 'faq', label: 'FAQ', count: faqs.length }
  ];

  const handleContentSelect = (content: HelpContent) => {
    setSelectedContent(content);
    if (content.steps && content.steps.length > 0) {
      startTutorial(content);
    }
  };

  const handleStartTutorial = () => {
    const tutorialContent = knowledgeBase.find(c => c.id === 'getting-started');
    if (tutorialContent) {
      startTutorial(tutorialContent);
      onClose(); // Fechar dialog para mostrar tutorial
    }
  };

  // Atalho de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open help from parent
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent role="dialog" aria-modal="true" className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              Central de Ajuda
              <Badge variant="secondary" className="text-xs">
                Ctrl+H
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            {/* Barra de busca */}
            <div className="mb-6">
              <HelpSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={searchSuggestions}
                placeholder="Buscar ajuda, tutoriais, FAQ..."
                autoFocus
              />
            </div>

            {/* Conteúdo principal */}
            {showFeedback ? (
              <FeedbackForm 
                onClose={() => setShowFeedback(false)} 
                context={context}
              />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="contextual" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Contextual
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Guias
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="support" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Suporte
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contextual" className="space-y-6">
                  <ContextualHelp
                    context={context}
                    onContentSelect={handleContentSelect}
                    onStartTutorial={handleStartTutorial}
                  />
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-6">
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeCategory ? "outline" : "default"}
                      size="sm"
                      onClick={() => setActiveCategory(null)}
                      className="gap-2"
                    >
                      <Filter className="h-3 w-3" />
                      Todos
                    </Button>
                    {categories.filter(c => c.id !== 'faq').map(category => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                        className="gap-2"
                      >
                        {category.label}
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* Lista de conteúdo */}
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredContent.map(content => (
                        <Card 
                          key={content.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleContentSelect(content)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{highlight(content.title, searchQuery)}</h3>
                                  <Badge 
                                    variant={content.category === 'tutorial' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {content.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {highlight(content.description, searchQuery)}
                                </p>
                                <div className="flex gap-1">
                                  {content.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground ml-4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredFAQs.map((faq, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{highlight(faq.question, searchQuery)}</h3>
                            <p className="text-sm text-muted-foreground">{highlight(faq.answer, searchQuery)}</p>
                            <div className="flex gap-1 mt-2">
                              {faq.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Suporte Direto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={() => window.open('https://wa.me/556496028022', '_blank')}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Suporte
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          onClick={() => setShowFeedback(true)}
                          className="w-full gap-2"
                          aria-label="Enviar Feedback"
                        >
                          <Star className="h-4 w-4" />
                          Enviar Feedback
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        content={currentContent}
        currentStep={tutorialStep}
        onNext={nextTutorialStep}
        onPrev={prevTutorialStep}
        onClose={finishTutorial}
        onComplete={finishTutorial}
      />
    </>
  );
};