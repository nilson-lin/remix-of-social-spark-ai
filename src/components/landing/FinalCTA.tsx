import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Video } from 'lucide-react';
export function FinalCTA() {
  return <section className="py-24 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }} className="glass-card p-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            Comece agora
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Pronto para criar{' '}
            
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Junte-se a milhares de profissionais que já estão economizando tempo 
            e gerando resultados com o CreativeFlow AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button className="btn-primary h-14 px-8 text-lg group">
                Começar grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/create-video">
              <Button variant="outline" className="h-14 px-8 text-lg border-accent/50 text-accent hover:bg-accent/10">
                <Video className="w-5 h-5 mr-2" />
                Criar vídeo com IA
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Não precisa de cartão de crédito • 10 criativos grátis
          </p>
        </motion.div>
      </div>
    </section>;
}