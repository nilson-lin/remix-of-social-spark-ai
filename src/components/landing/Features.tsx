import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Image, 
  MessageSquare, 
  Target, 
  Layers,
  Clock,
  Palette
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'IA Avançada',
    description: 'Modelos de linguagem de última geração para copy que converte.',
  },
  {
    icon: Zap,
    title: 'Ultra Rápido',
    description: 'Criativos completos em menos de 30 segundos.',
  },
  {
    icon: Image,
    title: 'Imagens Contextuais',
    description: 'Geração automática de imagens que combinam com seu texto.',
  },
  {
    icon: MessageSquare,
    title: '3 Variações',
    description: 'Escolha entre diferentes opções de copy para cada criativo.',
  },
  {
    icon: Target,
    title: 'Objetivos Claros',
    description: 'Otimizado para vendas, leads, engajamento ou marca.',
  },
  {
    icon: Layers,
    title: 'Multi-Plataforma',
    description: 'Instagram, Facebook, TikTok e Google Ads.',
  },
  {
    icon: Clock,
    title: 'Histórico Completo',
    description: 'Acesse todos os criativos que você já gerou.',
  },
  {
    icon: Palette,
    title: 'Estilos Visuais',
    description: 'Minimalista, publicitário, realista ou moderno.',
  },
];

export function Features() {
  return (
    <section className="py-24 px-4" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full border border-border/50 bg-muted/30 text-sm text-muted-foreground mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text">criar criativos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas que simplificam a criação de conteúdo 
            para suas campanhas de marketing digital.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 group hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
