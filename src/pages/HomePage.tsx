import { Link, useNavigate } from 'react-router-dom';
import { Ship, Package, MapPin, FileText, MessageSquare, ArrowRight, Search, Anchor, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const { isAuthenticated, isAdmin, isClient } = useAuth();
  const { shipments } = useStore();
  const navigate = useNavigate();

  const handleTrack = () => {
    if (!trackingNumber.trim()) return;
    const found = shipments.find(s => s.referenceNumber.toLowerCase() === trackingNumber.toLowerCase());
    if (found && isClient) {
      navigate(`/client/tracking`);
    } else {
      navigate('/login');
    }
  };

  const dashboardLink = isAdmin ? '/admin' : isClient ? '/client' : '/login';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Ship className="h-7 w-7 text-accent" />
            <span className="font-heading font-bold text-xl text-foreground">24/7 Logistics</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Accueil</Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Services</Link>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate(dashboardLink)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Mon espace
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-foreground">Connexion</Button>
                <Button onClick={() => navigate('/register')} className="bg-accent text-accent-foreground hover:bg-accent/90">Inscription</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary-foreground leading-tight">
              Votre partenaire logistique <span className="text-accent">mondial</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
              Simplifiez vos expéditions internationales. Réservation en ligne, suivi en temps réel, gestion documentaire — tout en un seul endroit.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate(isClient ? '/client/booking' : '/register')} className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
                Réserver un service <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/services')} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Nos services
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-16 max-w-xl bg-card/10 backdrop-blur-md rounded-2xl p-6 border border-primary-foreground/10">
            <h3 className="text-primary-foreground font-heading font-semibold mb-3 flex items-center gap-2">
              <Search className="h-5 w-5" /> Suivre votre expédition
            </h3>
            <div className="flex gap-3">
              <Input placeholder="Entrez votre n° de référence (ex: SH-2024-0001)" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTrack()} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40" />
              <Button onClick={handleTrack} className="bg-accent text-accent-foreground hover:bg-accent/90 px-6">Suivre</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground">Pourquoi choisir 24/7 Logistics ?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Une plateforme complète pour gérer vos expéditions de bout en bout.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: 'Réseau mondial', desc: 'Accès à plus de 15 ports internationaux majeurs.' },
              { icon: MapPin, title: 'Suivi en temps réel', desc: 'Suivez vos marchandises étape par étape.' },
              { icon: FileText, title: 'Documents centralisés', desc: 'Tous vos documents au même endroit.' },
              { icon: Shield, title: 'Sécurité garantie', desc: 'Vos marchandises assurées et protégées.' },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4"><feature.icon className="h-6 w-6 text-accent" /></div>
                <h3 className="font-heading font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container text-center">
          <h2 className="text-2xl font-heading font-bold text-foreground">Prêt à expédier ?</h2>
          <p className="mt-2 text-muted-foreground">Créez votre compte gratuitement et commencez à réserver vos services logistiques.</p>
          <Button size="lg" onClick={() => navigate('/register')} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            Créer mon compte <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="gradient-hero py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2"><Ship className="h-6 w-6 text-accent" /><span className="font-heading font-bold text-primary-foreground">24/7 Logistics</span></div>
            <p className="text-sm text-primary-foreground/60">© 2024 24/7 Logistics. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
