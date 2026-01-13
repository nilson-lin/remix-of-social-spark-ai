import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles } from 'lucide-react';
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [{
    label: 'Funcionalidades',
    href: '#features'
  }, {
    label: 'Como funciona',
    href: '#how-it-works'
  }, {
    label: 'Tipos',
    href: '#types'
  }, {
    label: 'Preços',
    href: '#pricing'
  }];
  return <motion.header initial={{
    y: -100
  }} animate={{
    y: 0
  }} transition={{
    duration: 0.5
  }} className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">
              Creative
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>)}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link to="/auth"><Button className="btn-primary px-4 py-2 text-sm">Começar grátis</Button></Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden border-t border-border/50 bg-background">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map(link => <a key={link.label} href={link.href} onClick={() => setIsOpen(false)} className="block text-muted-foreground hover:text-foreground py-2">{link.label}</a>)}
              <div className="pt-4 space-y-3 border-t border-border/50">
                <Link to="/auth" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full">Entrar</Button></Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}><Button className="btn-primary w-full">Começar grátis</Button></Link>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.header>;
}