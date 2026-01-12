import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Video, 
  ArrowLeft, 
  Loader2,
  Wand2,
  Zap,
  Upload,
  X,
  ImagePlus,
  Smartphone,
  Monitor,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

const platforms = [
  { id: 'reels', label: 'Instagram Reels', icon: Smartphone, aspectRatio: '9:16' },
  { id: 'tiktok', label: 'TikTok', icon: Smartphone, aspectRatio: '9:16' },
  { id: 'youtube_shorts', label: 'YouTube Shorts', icon: Smartphone, aspectRatio: '9:16' },
  { id: 'feed', label: 'Feed Square', icon: Square, aspectRatio: '1:1' },
  { id: 'landscape', label: 'Landscape', icon: Monitor, aspectRatio: '16:9' },
];

const durations = [
  { value: 5, label: '5 segundos' },
  { value: 10, label: '10 segundos' },
  { value: 15, label: '15 segundos' },
];

interface UploadedImage {
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
}

export default function CreateVideo() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'reels',
    duration: 5,
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || !user) return;

    const remainingSlots = 3 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      toast({
        title: 'Limite atingido',
        description: 'Você pode adicionar no máximo 3 imagens.',
        variant: 'destructive',
      });
      return;
    }

    const newImages: UploadedImage[] = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages(prev => [...prev, ...newImages]);

    // Upload each image
    for (let i = 0; i < newImages.length; i++) {
      const file = filesToAdd[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;

      try {
        const { data, error } = await supabase.storage
          .from('video-uploads')
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('video-uploads')
          .getPublicUrl(fileName);

        setImages(prev => prev.map((img, idx) => {
          if (idx === images.length + i) {
            return { ...img, uploading: false, url: urlData.publicUrl };
          }
          return img;
        }));
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Erro no upload',
          description: 'Não foi possível fazer upload da imagem.',
          variant: 'destructive',
        });
        setImages(prev => prev.filter((_, idx) => idx !== images.length + i));
      }
    }
  }, [images.length, user, toast]);

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Adicione um título para o vídeo.',
        variant: 'destructive',
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: 'Imagens obrigatórias',
        description: 'Adicione pelo menos 1 imagem.',
        variant: 'destructive',
      });
      return;
    }

    const uploadedImages = images.filter(img => img.url);
    if (uploadedImages.length !== images.length) {
      toast({
        title: 'Aguarde o upload',
        description: 'Algumas imagens ainda estão sendo enviadas.',
        variant: 'destructive',
      });
      return;
    }

    if (!profile || profile.credits < 2) {
      toast({
        title: 'Créditos insuficientes',
        description: 'Você precisa de 2 créditos para gerar um vídeo.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPlatform = platforms.find(p => p.id === formData.platform);
      const imageUrls = uploadedImages.map(img => img.url!);

      // Create video record
      const { data: video, error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user!.id,
          title: formData.title,
          description: formData.description,
          source_images: imageUrls,
          duration: formData.duration,
          aspect_ratio: selectedPlatform?.aspectRatio || '9:16',
          platform: formData.platform,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Deduct credits
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 2 })
        .eq('id', user!.id);

      if (creditError) {
        console.error('Error deducting credits:', creditError);
      }

      // Call edge function
      const { error: generateError } = await supabase.functions.invoke('generate-video', {
        body: {
          videoId: video.id,
          title: formData.title,
          description: formData.description,
          sourceImages: imageUrls,
          duration: formData.duration,
          aspectRatio: selectedPlatform?.aspectRatio || '9:16',
          platform: formData.platform,
        },
      });

      if (generateError) {
        await supabase
          .from('videos')
          .update({ status: 'failed' })
          .eq('id', video.id);
        throw generateError;
      }

      toast({
        title: 'Vídeo em geração! 🎬',
        description: 'Seu vídeo está sendo criado. Isso pode levar alguns minutos.',
      });

      refreshProfile();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating video:', error);
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

  const canSubmit = formData.title && images.length > 0 && images.every(img => img.url);

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg hidden sm:block">Gerar Vídeo V3</span>
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
            <h1 className="text-3xl font-bold mb-2">Criar Vídeo com IA</h1>
            <p className="text-muted-foreground">
              Faça upload de 1-3 imagens e gere vídeos automáticos para Reels/TikTok 🎬
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="glass-card p-6">
              <Label className="text-lg font-semibold mb-4 block">
                Imagens de Referência * <span className="text-sm font-normal text-muted-foreground">(1-3 imagens)</span>
              </Label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
                  isDragging 
                    ? "border-primary bg-primary/10" 
                    : "border-border/50 hover:border-primary/50",
                  images.length >= 3 && "opacity-50 pointer-events-none"
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 3}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImagePlus className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium mb-1">
                    {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG ou WEBP (máx. 10MB cada)
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              <AnimatePresence>
                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid grid-cols-3 gap-4"
                  >
                    {images.map((img, index) => (
                      <motion.div
                        key={img.preview}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border/50"
                      >
                        <img
                          src={img.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {img.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Video Details */}
            <div className="glass-card p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Vídeo *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Lançamento do novo produto"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que você quer no vídeo..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="bg-muted/50 border-border/50 min-h-[100px]"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-4">
                <Label className="block">Plataforma</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = formData.platform === platform.id;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => handleChange('platform', platform.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all duration-200",
                          isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border/50 hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5 mx-auto mb-1",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-xs font-medium block">{platform.label}</span>
                        <span className="text-[10px] text-muted-foreground">{platform.aspectRatio}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select
                  value={String(formData.duration)}
                  onValueChange={(value) => handleChange('duration', parseInt(value))}
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full btn-primary h-14 text-lg"
              disabled={isSubmitting || !profile || profile.credits < 2 || !canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando vídeo...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Gerar Vídeo com IA
                </>
              )}
            </Button>

            {profile && profile.credits < 2 && (
              <p className="text-center text-sm text-destructive">
                Você precisa de pelo menos 2 créditos para gerar um vídeo.
              </p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Cada vídeo consome 2 créditos
            </p>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
