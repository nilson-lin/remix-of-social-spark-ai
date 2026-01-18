import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

const plans = [{
  name: 'Gratuito',
  price: 'R$ 0',
  period: '',
  description: 'Para experimentar a plataforma',
  credits: '1 crédito grátis',
  icon: Zap,
  features: ['1 criativo para testar', 'Texto + imagem', 'Todas as redes sociais', 'Acesso básico'],
  cta: 'Começar grátis',
  highlighted: false
}, {
  name: 'Inicial',
  price: 'R$ 9,90',
  period: '',
  description: 'Perfeito para começar',
  credits: '10 créditos',
  icon: Sparkles,
  features: ['10 créditos', 'Geração de criativos', 'Texto + imagem', 'Todas as redes sociais', 'Suporte por email'],
  cta: 'Comprar créditos',
  highlighted: false
}, {
  name: 'Pro',
  price: 'R$ 24,90',
  period: '',
  description: 'Para profissionais',
  credits: '30 créditos',
  icon: Crown,
  features: ['30 créditos', 'Geração de criativos e vídeos', 'Texto + imagem + vídeo', 'Todas as redes sociais', 'Suporte prioritário'],
  cta: 'Comprar Pro',
  highlighted: true
}];
export function Pricing() {
  return <section className="py-24 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
      }} className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary mb-4">
            Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Escolha o plano ideal{' '}
            
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e escale conforme sua necessidade. 
            Cancele a qualquer momento, sem burocracia.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => <motion.div key={plan.name} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}>
              <div className={`glass-card p-8 h-full ${plan.highlighted ? 'border-primary/50 glow' : 'border-border/50'}`}>
                {plan.highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3" />
                      Mais popular
                    </span>
                  </div>}

                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.highlighted ? 'bg-primary/20' : 'bg-muted'}`}>
                    <plan.icon className={`w-6 h-6 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-2 font-medium ${plan.highlighted ? 'text-primary' : 'text-accent'}`}>{plan.credits}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(feature => <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>)}
                </ul>

                <Link to="/auth" className="block">
                  <Button className={`w-full h-12 ${plan.highlighted ? 'btn-primary' : 'bg-muted hover:bg-muted/80'}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>)}
        </div>

        {/* Guarantee */}
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
      }} className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            ✓ Garantia de 7 dias • ✓ Cancele quando quiser • ✓ Sem taxa de adesão
          </p>
        </motion.div>
      </div>
    </section>;
}