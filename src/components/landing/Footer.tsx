import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
export function Footer() {
  return <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Plataforma de criação de criativos com IA para redes sociais. Gere imagens, textos e vídeos profissionais em segundos.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Funcionalidades</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Preços</a></li>
              <li><a href="#types" className="hover:text-foreground">Tipos de criativos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Central de ajuda</a></li>
              <li><a href="#" className="hover:text-foreground">Termos de uso</a></li>
              <li><a href="#" className="hover:text-foreground">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CreativeFlow AI. Todos os direitos reservados.
        </div>
      </div>
    </footer>;
}