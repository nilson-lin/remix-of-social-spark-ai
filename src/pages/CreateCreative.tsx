import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2,
  Wand2,
  Zap
} from 'lucide-react';

export default function CreateCreative() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    niche: '',
    product: '',
    objective: '',
    social_network: '',
    tone: '',
    style: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const requiredFields = ['niche', 'product', 'objective', 'social_network', 'tone', 'style'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para gerar o criativo.',
        variant: 'destructive',
      });
      return;
    }

    // Check credits
    if (!profile || profile.credits < 1) {
      toast({
        title: 'Créditos insuficientes',
        description: 'Você não tem créditos suficientes. Faça upgrade do seu plano.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the creative record
      const { data: creative, error: insertError } = await supabase
        .from('creatives')
        .insert({
          user_id: user!.id,
          ...formData,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Deduct credit
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', user!.id);

      if (creditError) {
        console.error('Error deducting credit:', creditError);
      }

      // Call the generate edge function
      const { data: result, error: generateError } = await supabase.functions.invoke('generate-creative', {
        body: { creativeId: creative.id, ...formData },
      });

      if (generateError) {
        // Update status to failed
        await supabase
          .from('creatives')
          .update({ status: 'failed' })
          .eq('id', creative.id);

        throw generateError;
      }

      toast({
        title: 'Criativo gerado! ✨',
        description: 'Seu criativo foi criado com sucesso.',
      });

      refreshProfile();
      navigate(`/creative/${creative.id}`);
    } catch (error) {
      console.error('Error creating creative:', error);
      toast({
        title: 'Erro ao gerar',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                <span className="font-bold text-lg hidden sm:block">Novo Criativo</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{profile?.credits ?? 0} créditos</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Criar novo criativo</h1>
            <p className="text-muted-foreground">
              Preencha as informações e deixe a IA fazer a mágica ✨
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-6 space-y-6">
              {/* Niche and Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="niche">Nicho *</Label>
                  <Input
                    id="niche"
                    placeholder="Ex: Fitness, Moda, Tecnologia..."
                    value={formData.niche}
                    onChange={(e) => handleChange('niche', e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Produto ou Serviço *</Label>
                  <Input
                    id="product"
                    placeholder="Ex: Curso de Musculação Online"
                    value={formData.product}
                    onChange={(e) => handleChange('product', e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>

              {/* Objective and Network */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Objetivo do Criativo *</Label>
                  <Select
                    value={formData.objective}
                    onValueChange={(value) => handleChange('objective', value)}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">💰 Vendas</SelectItem>
                      <SelectItem value="leads">📋 Geração de Leads</SelectItem>
                      <SelectItem value="engagement">💬 Engajamento</SelectItem>
                      <SelectItem value="brand">🏆 Reconhecimento de Marca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rede Social *</Label>
                  <Select
                    value={formData.social_network}
                    onValueChange={(value) => handleChange('social_network', value)}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Selecione a rede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">📸 Instagram</SelectItem>
                      <SelectItem value="facebook">👍 Facebook</SelectItem>
                      <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                      <SelectItem value="google_ads">🔍 Google Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tone and Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tom da Comunicação *</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => handleChange('tone', value)}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Selecione o tom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">👔 Profissional</SelectItem>
                      <SelectItem value="informal">😊 Informal</SelectItem>
                      <SelectItem value="persuasive">🎯 Persuasivo</SelectItem>
                      <SelectItem value="creative">🎨 Criativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estilo Visual *</Label>
                  <Select
                    value={formData.style}
                    onValueChange={(value) => handleChange('style', value)}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Selecione o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist">✨ Minimalista</SelectItem>
                      <SelectItem value="advertising">📢 Publicitário</SelectItem>
                      <SelectItem value="realistic">📷 Realista</SelectItem>
                      <SelectItem value="modern">🚀 Moderno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full btn-primary h-14 text-lg"
              disabled={isSubmitting || !profile || profile.credits < 1}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando criativo...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Gerar Criativo com IA
                </>
              )}
            </Button>

            {profile && profile.credits < 1 && (
              <p className="text-center text-sm text-destructive">
                Você não tem créditos suficientes. Faça upgrade do seu plano.
              </p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Cada geração consome 1 crédito
            </p>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
