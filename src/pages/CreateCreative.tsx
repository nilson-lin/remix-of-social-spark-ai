import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Zap,
  ShoppingBag,
  Megaphone,
  Crown,
  Award,
  BookOpen,
  Layout,
  Moon,
  Sun,
  Flame,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos de criativo
const creativeTypes = [
  { id: 'venda', label: 'Venda', icon: ShoppingBag, description: 'Foco em conversão e vendas diretas', color: 'from-green-500 to-emerald-600' },
  { id: 'promocao', label: 'Promoção', icon: Megaphone, description: 'Ofertas especiais e descontos', color: 'from-orange-500 to-red-500' },
  { id: 'branding', label: 'Branding', icon: Crown, description: 'Fortalecer identidade da marca', color: 'from-purple-500 to-violet-600' },
  { id: 'autoridade', label: 'Autoridade', icon: Award, description: 'Posicionamento como expert', color: 'from-blue-500 to-indigo-600' },
  { id: 'storytelling', label: 'Storytelling', icon: BookOpen, description: 'Contar histórias envolventes', color: 'from-pink-500 to-rose-600' },
];

// Templates visuais
const visualTemplates = [
  { id: 'minimalista', label: 'Minimalista', icon: Layout, description: 'Clean e sofisticado', preview: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900' },
  { id: 'publicitario', label: 'Publicitário', icon: Megaphone, description: 'Impactante e chamativo', preview: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
  { id: 'dark_premium', label: 'Dark Premium', icon: Moon, description: 'Elegante e exclusivo', preview: 'bg-gradient-to-br from-gray-900 to-black' },
  { id: 'clean', label: 'Clean', icon: Sun, description: 'Leve e acessível', preview: 'bg-gradient-to-br from-sky-100 to-blue-200' },
  { id: 'chamativo', label: 'Chamativo', icon: Flame, description: 'Cores vibrantes e bold', preview: 'bg-gradient-to-br from-fuchsia-500 via-red-500 to-yellow-500' },
];

export default function CreateCreative() {
  const { user, profile, isAdmin, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    niche: '',
    product: '',
    objective: '',
    social_network: '',
    tone: '',
    style: '',
    creative_type: '',
    template: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

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
    const requiredFields = ['niche', 'product', 'objective', 'social_network', 'tone', 'style', 'creative_type', 'template'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para gerar o criativo.',
        variant: 'destructive',
      });
      return;
    }

    // Client-side credit check (server will verify and deduct)
    if (!isAdmin && (!profile || profile.credits < 1)) {
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
          niche: formData.niche,
          product: formData.product,
          objective: formData.objective,
          social_network: formData.social_network,
          tone: formData.tone,
          style: formData.style,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Credits are now deducted server-side in the edge function
      // Call the generate edge function with new fields
      const { data: result, error: generateError } = await supabase.functions.invoke('generate-creative', {
        body: { 
          creativeId: creative.id, 
          ...formData,
          creative_type: formData.creative_type,
          template: formData.template,
        },
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

  const canProceedToStep2 = formData.creative_type && formData.template;
  const canSubmit = formData.niche && formData.product && formData.objective && 
                    formData.social_network && formData.tone && formData.style && 
                    formData.creative_type && formData.template;

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
        <div className="max-w-5xl mx-auto px-4 py-4">
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

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div className={cn("w-8 h-1 rounded-full transition-all", step >= 2 ? "bg-primary" : "bg-muted")} />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                2
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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Escolha o tipo e template</h1>
                <p className="text-muted-foreground">
                  Selecione o tipo de criativo e o estilo visual desejado
                </p>
              </div>

              {/* Creative Type Selection */}
              <div className="mb-8">
                <Label className="text-lg font-semibold mb-4 block">Tipo de Criativo *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {creativeTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.creative_type === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        type="button"
                        onClick={() => handleChange('creative_type', type.id)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all duration-300 group",
                          isSelected 
                            ? "border-primary bg-primary/10 shadow-lg" 
                            : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br",
                          type.color
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1">{type.label}</h3>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Template Selection */}
              <div className="mb-8">
                <Label className="text-lg font-semibold mb-4 block">Template Visual *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {visualTemplates.map((template) => {
                    const Icon = template.icon;
                    const isSelected = formData.template === template.id;
                    return (
                      <motion.button
                        key={template.id}
                        type="button"
                        onClick={() => handleChange('template', template.id)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all duration-300 group",
                          isSelected 
                            ? "border-primary bg-primary/10 shadow-lg" 
                            : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className={cn(
                          "w-full h-16 rounded-lg mb-3 flex items-center justify-center",
                          template.preview,
                          template.id === 'dark_premium' && "text-white"
                        )}>
                          <Icon className={cn(
                            "w-6 h-6",
                            template.id === 'dark_premium' ? "text-white" : "text-gray-600"
                          )} />
                        </div>
                        <h3 className="font-semibold mb-1">{template.label}</h3>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="w-full btn-primary h-14 text-lg"
              >
                Continuar
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Detalhes do criativo</h1>
                <p className="text-muted-foreground">
                  Preencha as informações e deixe a IA fazer a mágica ✨
                </p>
              </div>

              {/* Selected Type and Template Summary */}
              <div className="glass-card p-4 mb-6 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <span className="font-medium">
                    {creativeTypes.find(t => t.id === formData.creative_type)?.label}
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Template:</span>
                  <span className="font-medium">
                    {visualTemplates.find(t => t.id === formData.template)?.label}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep(1)}
                  className="ml-auto"
                >
                  Alterar
                </Button>
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
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-14"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-primary h-14 text-lg"
                    disabled={isSubmitting || !profile || profile.credits < 1 || !canSubmit}
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
                </div>

                {profile && profile.credits < 1 && (
                  <p className="text-center text-sm text-destructive">
                    Você não tem créditos suficientes. Faça upgrade do seu plano.
                  </p>
                )}

                <p className="text-center text-sm text-muted-foreground">
                  Cada geração consome 1 crédito
                </p>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
