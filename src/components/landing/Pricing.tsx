import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para testar a plataforma',
    credits: '10 créditos/mês',
    features: [
      '10 criativos por mês',
      'Texto + imagem',
      'Todas as redes sociais',
      'Histórico de 30 dias',
    ],
    cta: 'Começar grátis',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: 'R$ 47',
    period: '/mês',
    description: 'Para profissionais independentes',
    credits: '100 créditos/mês',
    features: [
      '100 criativos por mês',
      'Texto + imagem',
      'Todas as redes sociais',
      'Histórico ilimitado',
      '3 variações de copy',
      'Suporte por email',
    ],
    cta: 'Assinar agora',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para equipes e agências',
    credits: '500 créditos/mês',
    features: [
      '500 criativos por mês',
      'Texto + imagem',
      'Todas as redes sociais',
      'Histórico ilimitado',
      '3 variações de copy',
      'Suporte prioritário',
      'API access',
      'White label',
    ],
    cta: 'Assinar agora',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 px-4" id="pricing">
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
            Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Escolha o plano ideal{' '}
            <span className="gradient-text">para você</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e escale conforme sua necessidade. 
            Cancele a qualquer momento.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative glass-card p-8 ${
                plan.highlighted
                  ? 'border-primary/50 glow'
                  : 'border-border/50'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3" />
                    Mais popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-primary mt-2">{plan.credits}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button
                  className={`w-full h-12 ${
                    plan.highlighted
                      ? 'btn-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
