import { Link, useNavigate } from 'react-router-dom';
import { Ship, Anchor, Package, Truck, FileCheck, Headphones, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const services = [
  { icon: Ship, title: 'Transport maritime FCL', desc: 'Conteneurs complets pour vos expéditions en volume. Service porte-à-porte ou port-à-port.', features: ['20\' / 40\' / 40\' HC', 'Reefer disponible', 'Couverture mondiale'] },
  { icon: Package, title: 'Transport maritime LCL', desc: 'Groupage pour vos envois de taille réduite. Solution économique et flexible.', features: ['Pas de minimum', 'Consolidation optimisée', 'Tarifs compétitifs'] },
  { icon: Anchor, title: 'Gestion portuaire', desc: 'Coordination complète des opérations portuaires et de manutention.', features: ['Chargement / déchargement', 'Stockage temporaire', 'Inspection'] },
  { icon: FileCheck, title: 'Dédouanement', desc: 'Prise en charge complète des formalités douanières et réglementaires.', features: ['Documentation', 'Conformité', 'Suivi des taxes'] },
  { icon: Truck, title: 'Livraison dernier kilomètre', desc: 'Transport terrestre depuis le port jusqu\'à votre entrepôt ou destination finale.', features: ['Camion dédié', 'Suivi GPS', 'Livraison planifiée'] },
  { icon: Headphones, title: 'Support dédié', desc: 'Une équipe d\'experts à votre disposition pour vous accompagner.', features: ['Conseiller attitré', 'Chat en ligne', 'Disponible 24/7'] },
];

export default function ServicesPage() {
  const navigate = useNavigate();

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
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-accent">Accueil</Link>
            <Link to="/services" className="text-sm font-medium text-foreground hover:text-accent">Services</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>Connexion</Button>
            <Button onClick={() => navigate('/register')} className="bg-accent text-accent-foreground hover:bg-accent/90">Inscription</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-16">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Nos Services</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl">
            Des solutions logistiques complètes pour accompagner vos expéditions internationales.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-8 hover:shadow-xl transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-card-foreground">{service.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{service.desc}</p>
                <ul className="mt-4 space-y-2">
                  {service.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted">
        <div className="container text-center">
          <h2 className="text-2xl font-heading font-bold text-foreground">Besoin d'un devis ?</h2>
          <p className="mt-2 text-muted-foreground">Créez une réservation et recevez votre estimation rapidement.</p>
          <Button size="lg" onClick={() => navigate('/register')} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            Réserver maintenant <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="gradient-hero py-8">
        <div className="container text-center">
          <p className="text-sm text-primary-foreground/60">© 2024 24/7 Logistics. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
