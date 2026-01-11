import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  ArrowLeft, 
  Search,
  Image as ImageIcon,
  Trash2,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Creative = Tables<'creatives'>;

export default function History() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCreatives();
    }
  }, [user]);

  const fetchCreatives = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('creatives')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCreatives(data);
    }
    setLoadingCreatives(false);
  };

  const deleteCreative = async (id: string) => {
    const { error } = await supabase
      .from('creatives')
      .delete()
      .eq('id', id);

    if (!error) {
      setCreatives((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: 'Criativo excluído',
        description: 'O criativo foi removido com sucesso.',
      });
    } else {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o criativo.',
        variant: 'destructive',
      });
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

  const filteredCreatives = creatives.filter((creative) => {
    const matchesSearch =
      creative.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creative.headline && creative.headline.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesNetwork = filterNetwork === 'all' || creative.social_network === filterNetwork;

    return matchesSearch && matchesNetwork;
  });

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
                <span className="font-bold text-lg hidden sm:block">Histórico</span>
              </div>
            </div>

            <Link to="/create">
              <Button className="btn-primary">
                Criar novo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por produto, nicho ou headline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50"
              />
            </div>
            <Select value={filterNetwork} onValueChange={setFilterNetwork}>
              <SelectTrigger className="w-full sm:w-48 bg-muted/50 border-border/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Rede social" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as redes</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="google_ads">Google Ads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loadingCreatives ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="aspect-square rounded-lg bg-muted mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCreatives.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || filterNetwork !== 'all'
                  ? 'Nenhum criativo encontrado'
                  : 'Nenhum criativo ainda'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterNetwork !== 'all'
                  ? 'Tente ajustar seus filtros.'
                  : 'Comece criando seu primeiro criativo com IA.'}
              </p>
              {!searchTerm && filterNetwork === 'all' && (
                <Link to="/create">
                  <Button className="btn-primary">Criar agora</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreatives.map((creative) => (
                <motion.div
                  key={creative.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card overflow-hidden group"
                >
                  <Link to={`/creative/${creative.id}`}>
                    <div className="relative aspect-square">
                      {creative.image_url ? (
                        <img
                          src={creative.image_url}
                          alt={creative.headline || 'Creative'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        creative.status === 'completed'
                          ? 'bg-accent/90 text-accent-foreground'
                          : creative.status === 'generating'
                          ? 'bg-primary/90 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {creative.status === 'completed' ? 'Concluído' :
                         creative.status === 'generating' ? 'Gerando...' :
                         creative.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/creative/${creative.id}`}>
                      <h3 className="font-medium truncate mb-1 hover:text-primary transition-colors">
                        {creative.headline || creative.product}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{getNetworkLabel(creative.social_network)}</span>
                        <span>•</span>
                        <span>{getObjectiveLabel(creative.objective)}</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir criativo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O criativo será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteCreative(creative.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(creative.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
