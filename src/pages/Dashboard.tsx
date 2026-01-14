import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Plus, 
  LogOut, 
  Clock, 
  Zap,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  User,
  Crown,
  Shield,
  Video,
  Play,
  Pause,
  Loader2
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Creative = Tables<'creatives'>;
type VideoRecord = Tables<'videos'>;

export default function Dashboard() {
  const { user, profile, isAdmin, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCreatives();
      fetchVideos();
      refreshProfile();
    }
  }, [user]);

  const fetchCreatives = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('creatives')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setCreatives(data);
    }
    setLoadingCreatives(false);
  };

  const fetchVideos = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setVideos(data);
    }
    setLoadingVideos(false);
  };

  const toggleVideoPlay = (videoId: string) => {
    const videoEl = videoRefs.current[videoId];
    if (!videoEl) return;

    if (playingVideoId === videoId) {
      videoEl.pause();
      setPlayingVideoId(null);
    } else {
      // Pause any other playing video
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        videoRefs.current[playingVideoId]?.pause();
      }
      videoEl.play();
      setPlayingVideoId(videoId);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      icon: Zap,
      label: 'Créditos disponíveis',
      value: profile?.credits ?? 0,
      color: 'text-primary',
    },
    {
      icon: ImageIcon,
      label: 'Criativos gerados',
      value: creatives.length,
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'Plano atual',
      value: profile?.plan?.charAt(0).toUpperCase() + (profile?.plan?.slice(1) ?? ''),
      color: 'text-secondary',
    },
  ];

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      sales: 'Vendas',
      leads: 'Leads',
      engagement: 'Engajamento',
      brand: 'Marca',
    };
    return labels[objective] || objective;
  };

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      reels: 'Instagram Reels',
      tiktok: 'TikTok',
      youtube_shorts: 'YouTube Shorts',
      feed: 'Feed Square',
      landscape: 'Landscape',
    };
    return labels[platform] || platform;
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg hidden sm:block">CreativeAI</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{profile?.credits ?? 0} créditos</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                  {isAdmin ? (
                    <Crown className="w-4 h-4 text-destructive" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="text-sm hidden sm:block">{profile?.full_name || user?.email}</span>
                {isAdmin && (
                  <Badge variant="destructive" className="gap-1 hidden sm:flex">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
              </div>

              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'usuário'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Pronto para criar criativos incríveis hoje?
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Create new options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link to="/create">
            <div className="glass-card p-8 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group h-full">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Criar novo criativo</h3>
                <p className="text-muted-foreground max-w-md">
                  Gere headline, texto, CTA e imagem otimizados para sua campanha em segundos.
                </p>
              </div>
            </div>
          </Link>

          <Link to="/create-video">
            <div className="glass-card p-8 border-dashed border-2 border-border hover:border-pink-500/50 transition-colors cursor-pointer group h-full">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:from-pink-500/30 group-hover:to-orange-500/30 transition-colors">
                  <Video className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Criar novo vídeo</h3>
                <p className="text-muted-foreground max-w-md">
                  Gere vídeos incríveis para Reels, TikTok e Shorts com IA.
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recent Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-500" />
              Vídeos recentes
            </h2>
          </div>

          {loadingVideos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="aspect-[9/16] rounded-lg bg-muted mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum vídeo ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro vídeo com IA.
              </p>
              <Link to="/create-video">
                <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                  <Video className="w-4 h-4 mr-2" />
                  Criar vídeo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="glass-card p-4 hover:border-pink-500/50 transition-colors">
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted mb-3">
                    {video.status === 'completed' && video.video_url ? (
                      <>
                        <video
                          ref={(el) => { videoRefs.current[video.id] = el; }}
                          src={video.video_url}
                          poster={video.thumbnail_url || undefined}
                          className="w-full h-full object-cover"
                          loop
                          muted
                          playsInline
                          onEnded={() => setPlayingVideoId(null)}
                        />
                        <button
                          onClick={() => toggleVideoPlay(video.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                        >
                          {playingVideoId === video.id ? (
                            <Pause className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Play className="w-12 h-12 text-white" />
                          )}
                        </button>
                      </>
                    ) : video.status === 'generating' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/20 to-orange-500/20">
                        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-2" />
                        <span className="text-sm text-muted-foreground">Gerando...</span>
                      </div>
                    ) : video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      video.status === 'completed' 
                        ? 'bg-accent/90 text-accent-foreground' 
                        : video.status === 'generating'
                        ? 'bg-pink-500/90 text-white'
                        : 'bg-destructive/90 text-destructive-foreground'
                    }`}>
                      {video.status === 'completed' ? '✓ Pronto' : 
                       video.status === 'generating' ? '⏳ Gerando' : '✗ Falhou'}
                    </div>

                    {/* Duration badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                        {video.duration}s
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium truncate mb-1">{video.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getPlatformLabel(video.platform || '')}</span>
                    <span>•</span>
                    <span>{new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent creatives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Criativos recentes</h2>
            {creatives.length > 0 && (
              <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loadingCreatives ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : creatives.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum criativo ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro criativo com IA.
              </p>
              <Link to="/create">
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar agora
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {creatives.map((creative) => (
                <Link key={creative.id} to={`/creative/${creative.id}`}>
                  <div className="glass-card p-6 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      {creative.image_url ? (
                        <img 
                          src={creative.image_url} 
                          alt={creative.headline || 'Creative'} 
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {creative.headline || creative.product}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{getNetworkLabel(creative.social_network)}</span>
                          <span>•</span>
                          <span>{getObjectiveLabel(creative.objective)}</span>
                          <span>•</span>
                          <span>{new Date(creative.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        creative.status === 'completed' 
                          ? 'bg-accent/20 text-accent' 
                          : creative.status === 'generating'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {creative.status === 'completed' ? 'Concluído' : 
                         creative.status === 'generating' ? 'Gerando...' : 
                         creative.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
