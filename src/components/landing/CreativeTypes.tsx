import { motion } from 'framer-motion';
import { ShoppingCart, Percent, Award, Crown, BookOpen, Video, Image, FileText } from 'lucide-react';
const creativeTypes = [{
  icon: ShoppingCart,
  title: 'Venda Direta',
  description: 'Criativos focados em conversão e vendas imediatas.',
  gradient: 'from-primary to-secondary',
  bgColor: 'bg-primary/10',
  iconColor: 'text-primary'
}, {
  icon: Percent,
  title: 'Promoção',
  description: 'Ofertas especiais, descontos e promoções urgentes.',
  gradient: 'from-destructive to-primary',
  bgColor: 'bg-destructive/10',
  iconColor: 'text-destructive'
}, {
  icon: Award,
  title: 'Branding',
  description: 'Fortalecimento de marca e posicionamento.',
  gradient: 'from-secondary to-accent',
  bgColor: 'bg-secondary/10',
  iconColor: 'text-secondary'
}, {
  icon: Crown,
  title: 'Autoridade',
  description: 'Depoimentos, cases e prova social.',
  gradient: 'from-accent to-primary',
  bgColor: 'bg-accent/10',
  iconColor: 'text-accent'
}, {
  icon: BookOpen,
  title: 'Storytelling',
  description: 'Histórias que conectam e engajam.',
  gradient: 'from-primary to-accent',
  bgColor: 'bg-primary/10',
  iconColor: 'text-primary'
}, {
  icon: Video,
  title: 'Vídeo Curto',
  description: 'Reels, TikToks e Shorts com animação.',
  gradient: 'from-accent to-secondary',
  bgColor: 'bg-accent/10',
  iconColor: 'text-accent'
}];
const outputTypes = [{
  icon: FileText,
  title: 'Copy Completa',
  items: ['Headline', 'Texto principal', 'CTA', '3 variações']
}, {
  icon: Image,
  title: 'Imagem',
  items: ['1080x1080', 'Alta qualidade', 'Pronta para uso']
}, {
  icon: Video,
  title: 'Vídeo',
  items: ['Reels/TikTok', 'Animações', 'Transições']
}];
export function CreativeTypes() {
  return <section className="py-24 px-4 bg-muted/30" id="types">
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
            Tipos de criativos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Criativos para{' '}
            
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o tipo de criativo ideal para sua campanha. 
            Nossa IA adapta o tom, estilo e formato automaticamente.
          </p>
        </motion.div>

        {/* Creative Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {creativeTypes.map((type, index) => <motion.div key={type.title} initial={{
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
        }} className="glass-card p-6 group hover:border-primary/50 transition-all duration-300 cursor-pointer">
              <div className={`w-14 h-14 rounded-xl ${type.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <type.icon className={`w-7 h-7 ${type.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </motion.div>)}
        </div>

        {/* Output Types */}
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
      }} className="glass-card p-8">
          <h3 className="text-xl font-semibold text-center mb-8">
            O que você recebe em cada geração
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outputTypes.map((output, index) => <div key={output.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <output.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-3">{output.title}</h4>
                <ul className="space-y-2">
                  {output.items.map(item => <li key={item} className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {item}
                    </li>)}
                </ul>
              </div>)}
          </div>
        </motion.div>
      </div>
    </section>;
}