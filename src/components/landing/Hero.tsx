import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, Video, Image, Wand2 } from 'lucide-react';
export function Hero() {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            CreativeFlow AI • Plataforma de criativos com IA
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.1
      }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          Crie criativos profissionais{' '}
          <br className="hidden md:block" />
          e vídeos <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">em segundos com IA</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }} className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Imagens, textos e vídeos prontos para redes sociais, feitos para conversão.
          <br className="hidden sm:block" />
          Headlines, copy, CTAs e mídia gerados automaticamente.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.3
      }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth">
            <Button className="btn-primary h-14 px-8 text-lg group">
              <Image className="w-5 h-5 mr-2" />
              Gerar criativo agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/create-video">
            <Button className="h-14 px-8 text-lg border-2 border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold">
              <Video className="w-5 h-5 mr-2" />
              Criar vídeo com IA
              <span className="ml-2 px-2 py-0.5 text-xs bg-accent/20 rounded-full">v3</span>
            </Button>
          </Link>
        </motion.div>

        {/* Mockups Preview */}
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.7,
        delay: 0.5
      }} className="mt-16 relative">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Instagram Post Mockup */}
            <motion.div animate={{
            y: [0, -10, 0]
          }} transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }} className="glass-card p-4 w-48 md:w-64 hidden sm:block">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-3 flex items-center justify-center">
                <Image className="w-12 h-12 text-primary/50" />
              </div>
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-2 bg-muted/50 rounded w-full mb-1" />
              <div className="h-2 bg-muted/50 rounded w-2/3" />
            </motion.div>

            {/* Main Preview */}
            <motion.div animate={{
            y: [0, -15, 0]
          }} transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }} className="glass-card p-6 w-72 md:w-80">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">Criativo gerado</span>
                <span className="ml-auto text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">✓ Pronto</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                <Play className="w-16 h-16 text-foreground/50" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-primary/20 rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
                <div className="h-3 bg-muted/50 rounded w-3/5" />
              </div>
            </motion.div>

            {/* Video Mockup */}
            <motion.div animate={{
            y: [0, -8, 0]
          }} transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }} className="glass-card p-4 w-48 md:w-56 hidden sm:block">
              <div className="video-badge mb-3">
                <Video className="w-3 h-3" />
                Vídeo AI
              </div>
              <div className="aspect-[9/16] bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
                <Play className="w-10 h-10 text-accent/50" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.6
      }} className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/30">
          {[{
          value: '50k+',
          label: 'Criativos gerados'
        }, {
          value: '<30s',
          label: 'Tempo médio'
        }, {
          value: '4.9★',
          label: 'Avaliação'
        }].map(stat => <div key={stat.label} className="text-center">
              
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>)}
        </motion.div>
      </div>

      {/* Floating elements */}
      <motion.div animate={{
      y: [0, -20, 0],
      rotate: [0, 5, 0]
    }} transition={{
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut'
    }} className="absolute top-1/4 left-10 w-20 h-20 rounded-2xl glass-card hidden lg:flex items-center justify-center">
        <span className="text-3xl">📱</span>
      </motion.div>
      <motion.div animate={{
      y: [0, 20, 0],
      rotate: [0, -5, 0]
    }} transition={{
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: 1
    }} className="absolute top-1/3 right-10 w-20 h-20 rounded-2xl glass-card hidden lg:flex items-center justify-center">
        <span className="text-3xl">🎬</span>
      </motion.div>
      <motion.div animate={{
      y: [0, -15, 0]
    }} transition={{
      duration: 7,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: 2
    }} className="absolute bottom-1/4 left-20 w-16 h-16 rounded-xl glass-card hidden lg:flex items-center justify-center">
        <span className="text-2xl">✨</span>
      </motion.div>
      <motion.div animate={{
      y: [0, 15, 0]
    }} transition={{
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: 0.5
    }} className="absolute bottom-1/3 right-20 w-16 h-16 rounded-xl glass-card hidden lg:flex items-center justify-center">
        <span className="text-2xl">🎨</span>
      </motion.div>
    </section>;
}