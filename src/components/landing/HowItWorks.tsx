import { motion } from 'framer-motion';
import { FileText, Wand2, Download, CheckCircle } from 'lucide-react';
const steps = [{
  step: '01',
  icon: FileText,
  title: 'Defina sua campanha',
  description: 'Escolha o nicho, produto, objetivo e estilo do seu criativo.',
  color: 'primary'
}, {
  step: '02',
  icon: Wand2,
  title: 'IA gera em segundos',
  description: 'Nossa IA cria headline, copy, CTA e imagem automaticamente.',
  color: 'secondary'
}, {
  step: '03',
  icon: Download,
  title: 'Baixe e publique',
  description: 'Escolha entre 3 variações e use direto nas redes sociais.',
  color: 'accent'
}];
export function HowItWorks() {
  return <section className="py-24 px-4 relative overflow-hidden" id="how-it-works">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
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
          <span className="inline-block px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-sm font-medium text-secondary mb-4">
            Como funciona
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Criativos profissionais em{' '}
            
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sem complicação. Preencha as informações, deixe a IA trabalhar 
            e tenha seu criativo pronto em menos de 30 segundos.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />

          {steps.map((step, index) => <motion.div key={step.step} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.2
        }} className="relative">
              <div className="glass-card p-8 text-center group hover:border-primary/50 transition-all duration-300">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step.color === 'primary' ? 'bg-primary text-primary-foreground' : step.color === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'}`}>
                    {step.step}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-colors ${step.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' : step.color === 'secondary' ? 'bg-secondary/10 group-hover:bg-secondary/20' : 'bg-accent/10 group-hover:bg-accent/20'}`}>
                  <step.icon className={`w-8 h-8 ${step.color === 'primary' ? 'text-primary' : step.color === 'secondary' ? 'text-secondary' : 'text-accent'}`} />
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>)}
        </div>

        {/* Result indicator */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        delay: 0.8
      }} className="flex items-center justify-center gap-3 mt-12">
          <CheckCircle className="w-6 h-6 text-accent" />
          <span className="text-muted-foreground">
            Resultado: <span className="text-foreground font-medium">Criativo completo pronto para usar</span>
          </span>
        </motion.div>
      </div>
    </section>;
}