import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  ArrowLeft, 
  Copy,
  Download,
  Check,
  Instagram,
  Facebook,
  Video,
  Globe,
  Loader2
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Creative = Tables<'creatives'>;

interface Variation {
  headline: string;
  text: string;
  cta: string;
}

export default function CreativeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [creative, setCreative] = useState<Creative | null>(null);
  const [loadingCreative, setLoadingCreative] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchCreative();
    }
  }, [id, user]);

  const fetchCreative = async () => {
    if (!id || !user) return;

    const { data, error } = await supabase
      .from('creatives')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      toast({
        title: 'Criativo não encontrado',
        description: 'Este criativo não existe ou você não tem acesso.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setCreative(data);
    setLoadingCreative(false);

    // Poll for updates if generating
    if (data.status === 'generating') {
      const interval = setInterval(async () => {
        const { data: updated } = await supabase
          .from('creatives')
          .select('*')
          .eq('id', id)
          .single();

        if (updated && updated.status !== 'generating') {
          setCreative(updated);
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    });
  };

  const downloadImage = () => {
    if (!creative?.image_url) return;
    
    const link = document.createElement('a');
    link.href = creative.image_url;
    link.download = `creative-${creative.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'tiktok':
        return <Video className="w-5 h-5" />;
      case 'google_ads':
        return <Globe className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getNetworkLabel = (network: string) => {
    const labels: Record<string, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      google_ads: 'Google Ads',
    };
    return labels[network] || network;
  };

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      sales: 'Vendas',
      leads: 'Leads',
      engagement: 'Engajamento',
      brand: 'Marca',
    };
    return labels[objective] || objective;
  };

  if (loading || loadingCreative) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando criativo...</p>
        </div>
      </div>
    );
  }

  if (!creative) {
    return null;
  }

  const variations: Variation[] = creative.variations 
    ? (creative.variations as unknown as Variation[]) 
    : [];

  const currentVariation = variations[selectedVariation] || {
    headline: creative.headline || '',
    text: creative.main_text || '',
    cta: creative.cta || '',
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-lg hidden sm:block">Criativo</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getNetworkIcon(creative.social_network)}
              <span className="text-sm">{getNetworkLabel(creative.social_network)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {creative.status === 'generating' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Gerando seu criativo...</h2>
            <p className="text-muted-foreground mb-4">
              A IA está trabalhando na sua headline, texto, CTA e imagem.
            </p>
            <div className="w-full max-w-md mx-auto h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" style={{ width: '60%' }} />
            </div>
          </motion.div>
        ) : creative.status === 'failed' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Erro ao gerar</h2>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro ao gerar seu criativo. Tente novamente.
            </p>
            <Link to="/create">
              <Button className="btn-primary">
                Tentar novamente
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass-card overflow-hidden">
                {/* Phone mockup for social preview */}
                <div className="bg-muted/50 p-4">
                  <div className="mx-auto max-w-[375px]">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
                      <div>
                        <p className="text-sm font-semibold">Sua Marca</p>
                        <p className="text-xs text-muted-foreground">Patrocinado</p>
                      </div>
                    </div>

                    {/* Image */}
                    {creative.image_url ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                        <img
                          src={creative.image_url}
                          alt="Creative"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-4">
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">{currentVariation.headline}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {currentVariation.text}
                      </p>
                      <Button className="w-full btn-primary h-10 text-sm mt-4">
                        {currentVariation.cta || 'Saiba mais'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border/50 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={downloadImage}
                    disabled={!creative.image_url}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Info */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Informações</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nicho</p>
                    <p className="font-medium">{creative.niche}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Produto</p>
                    <p className="font-medium">{creative.product}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Objetivo</p>
                    <p className="font-medium">{getObjectiveLabel(creative.objective)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rede Social</p>
                    <p className="font-medium">{getNetworkLabel(creative.social_network)}</p>
                  </div>
                </div>
              </div>

              {/* Variations */}
              {variations.length > 1 && (
                <Tabs 
                  defaultValue="0" 
                  value={String(selectedVariation)}
                  onValueChange={(v) => setSelectedVariation(Number(v))}
                >
                  <TabsList className="w-full">
                    {variations.map((_, i) => (
                      <TabsTrigger key={i} value={String(i)} className="flex-1">
                        Variação {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {/* Copy sections */}
              <div className="space-y-4">
                {/* Headline */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Headline</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(currentVariation.headline, 'headline')}
                    >
                      {copiedField === 'headline' ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="font-semibold">{currentVariation.headline}</p>
                </div>

                {/* Main text */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Texto Principal</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(currentVariation.text, 'text')}
                    >
                      {copiedField === 'text' ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{currentVariation.text}</p>
                </div>

                {/* CTA */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">CTA</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(currentVariation.cta, 'cta')}
                    >
                      {copiedField === 'cta' ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="font-medium text-primary">{currentVariation.cta}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
