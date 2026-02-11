import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowLeft, 
  Users, 
  Shield, 
  Search,
  UserPlus,
  Trash2,
  Crown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string | null;
  credits: number;
  plan: string;
  created_at: string;
  email: string | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addRoleEmail, setAddRoleEmail] = useState('');
  const [addRoleType, setAddRoleType] = useState<string>('admin');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && !isAdmin) {
      navigate('/dashboard');
      toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoadingUsers(false);
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (!error && data) {
      const rolesMap: Record<string, string> = {};
      data.forEach((role: UserRole) => {
        rolesMap[role.user_id] = role.role;
      });
      setUserRoles(rolesMap);
    }
  };

  const updateCredits = async (userId: string, newCredits: number) => {
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (error) {
      toast.error('Erro ao atualizar créditos');
    } else {
      toast.success('Créditos atualizados!');
      fetchUsers();
    }
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', userId);

    if (error) {
      toast.error('Erro ao atualizar plano');
    } else {
      toast.success('Plano atualizado!');
      fetchUsers();
    }
  };

  const addRole = async () => {
    if (!addRoleEmail.trim()) {
      toast.error('Digite o email do usuário');
      return;
    }

    setIsAddingRole(true);

    // Look up user by email
    const { data: userExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', addRoleEmail.trim())
      .single();

    if (!userExists) {
      toast.error('Usuário não encontrado com esse email');
      setIsAddingRole(false);
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userExists.id, 
        role: addRoleType as 'admin' | 'moderator' | 'user'
      }, {
        onConflict: 'user_id,role'
      });

    if (error) {
      toast.error('Erro ao adicionar role: ' + error.message);
    } else {
      toast.success('Role adicionada com sucesso!');
      setAddRoleEmail('');
      setDialogOpen(false);
      fetchRoles();
    }
    setIsAddingRole(false);
  };

  const removeRole = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      toast.error('Erro ao remover role');
    } else {
      toast.success('Role removida!');
      fetchRoles();
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (userId: string) => {
    const role = userRoles[userId];
    if (!role) return null;

    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: typeof Crown }> = {
      admin: { variant: 'destructive', icon: Crown },
      moderator: { variant: 'default', icon: Shield },
      user: { variant: 'secondary', icon: Users },
    };

    const config = variants[role] || variants.user;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {role}
      </Badge>
    );
  };

  if (loading || !isAdmin) {
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <span className="font-bold text-lg">Painel Admin</span>
                  <p className="text-xs text-muted-foreground">Gerenciar usuários e roles</p>
                </div>
              </div>
            </div>

            <Link to="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold hidden sm:block">CreativeAI</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de usuários</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">
                    {Object.values(userRoles).filter(r => r === 'admin').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com roles</p>
                  <p className="text-2xl font-bold">{Object.keys(userRoles).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Role a Usuário</DialogTitle>
                  <DialogDescription>
                    Digite o email do usuário e selecione a role desejada.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email do Usuário</label>
                    <Input
                      placeholder="email@exemplo.com"
                      type="email"
                      value={addRoleEmail}
                      onChange={(e) => setAddRoleEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Select value={addRoleType} onValueChange={setAddRoleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full btn-primary" 
                    onClick={addRole}
                    disabled={isAddingRole}
                  >
                    {isAddingRole ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users table */}
          <div className="glass-card overflow-hidden">
            {loadingUsers ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userProfile.full_name || 'Sem nome'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {userProfile.email || userProfile.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(userProfile.id) || (
                          <Badge variant="outline">Nenhuma</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={userProfile.credits}
                          onChange={(e) => updateCredits(userProfile.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={userProfile.plan} 
                          onValueChange={(value) => updatePlan(userProfile.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {userRoles[userProfile.id] && userProfile.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRole(userProfile.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
