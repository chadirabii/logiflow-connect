import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      toast.success('Connexion réussie');
      // Check user role from localStorage after login
      const user = JSON.parse(localStorage.getItem('logistics_user') || '{}');
      const redirectMap: Record<string, string> = { admin: '/admin', manager: '/manager', client: '/client' };
      navigate(redirectMap[user.role] || '/client');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Ship className="h-7 w-7 text-accent" />
            <span className="font-heading font-bold text-xl text-foreground">24/7 Logistics</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-foreground">Connexion</h1>
          <p className="mt-2 text-muted-foreground">Accédez à votre espace de gestion logistique.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Se connecter</Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Pas encore de compte ? <Link to="/register" className="text-accent hover:underline font-medium">S'inscrire</Link>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Comptes de démonstration :</p>
            <p className="text-xs text-muted-foreground"><strong>Admin :</strong> admin@247logistics.com / admin123</p>
            <p className="text-xs text-muted-foreground"><strong>Client :</strong> karim@textilemarket.ma / client123</p>
          </div>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <Ship className="h-24 w-24 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-heading font-bold text-primary-foreground">Bienvenue</h2>
          <p className="mt-3 text-primary-foreground/70 max-w-sm">
            Gérez vos expéditions, suivez vos marchandises et communiquez avec votre équipe logistique.
          </p>
        </div>
      </div>
    </div>
  );
}
