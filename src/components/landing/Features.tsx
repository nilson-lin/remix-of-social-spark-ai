import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Image, 
  MessageSquare, 
  Target, 
  Layers,
  Clock,
  Palette,
  Upload,
  Video,
  Wand2,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'IA Avançada',
    description: 'Modelos de linguagem e visão de última geração para copy e imagens que convertem.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Ultra Rápido',
    description: 'Criativos completos com texto e imagem em menos de 30 segundos.',
    color: 'accent',
  },
  {
    icon: Video,
    title: 'Vídeos com IA',
    description: 'Transforme imagens em vídeos curtos animados para Reels e TikTok.',
    color: 'secondary',
  },
  {
    icon: Upload,
    title: 'Upload de Referência',
    description: 'Use suas imagens como base para manter identidade visual.',
    color: 'primary',
  },
  {
    icon: MessageSquare,
    title: '3 Variações',
    description: 'Escolha entre diferentes opções de copy para cada criativo.',
    color: 'accent',
  },
  {
    icon: Wand2,
    title: 'Enhancement Premium',
    description: 'Melhore a qualidade das imagens com upscale e nitidez.',
    color: 'secondary',
  },
  {
    icon: Target,
    title: 'Objetivos Claros',
    description: 'Otimizado para vendas, leads, engajamento ou marca.',
    color: 'primary',
  },
  {
    icon: Layers,
    title: 'Multi-Plataforma',
    description: 'Instagram, Facebook, TikTok e Google Ads.',
    color: 'accent',
  },
  {
    icon: Palette,
    title: '5 Templates Visuais',
    description: 'Minimalista, publicitário, dark premium, clean e chamativo.',
    color: 'secondary',
  },
  {
    icon: Clock,
    title: 'Histórico Completo',
    description: 'Acesse todos os criativos que você já gerou.',
    color: 'primary',
  },
  {
    icon: Image,
    title: 'Imagens Contextuais',
    description: 'Geração automática de imagens que combinam com seu texto.',
    color: 'accent',
  },
  {
    icon: Shield,
    title: 'Qualidade Premium',
    description: 'Resultados profissionais prontos para publicar.',
    color: 'secondary',
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
          <span className="inline-block px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-sm font-medium text-accent mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tudo para criar{' '}
            <span className="gradient-text">criativos de alta conversão</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas que simplificam a criação de conteúdo 
            visual e textual para suas campanhas de marketing digital.
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
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass-card p-6 group hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                feature.color === 'primary' 
                  ? 'bg-primary/10 group-hover:bg-primary/20' 
                  : feature.color === 'secondary'
                  ? 'bg-secondary/10 group-hover:bg-secondary/20'
                  : 'bg-accent/10 group-hover:bg-accent/20'
              }`}>
                <feature.icon className={`w-6 h-6 ${
                  feature.color === 'primary' 
                    ? 'text-primary' 
                    : feature.color === 'secondary'
                    ? 'text-secondary'
                    : 'text-accent'
                }`} />
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