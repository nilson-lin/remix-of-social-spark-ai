import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Plus, 
  LogOut, 
  Clock, 
  Zap,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  User
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Creative = Tables<'creatives'>;

export default function Dashboard() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCreatives();
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
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm hidden sm:block">{profile?.full_name || user?.email}</span>
              </div>

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

        {/* Create new */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Link to="/create">
            <div className="glass-card p-8 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group">
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
