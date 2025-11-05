import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, ListChecks, Shield, TrendingUp, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Bell,
    title: "Notifications instantanées",
    description: "Les serveurs reçoivent les commandes en temps réel via notifications push",
    color: "primary",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Réduisez les temps d'attente et fluidifiez le service en salle",
    color: "secondary",
  },
  {
    icon: ListChecks,
    title: "Gestion simplifiée",
    description: "Suivez toutes les commandes depuis un tableau de bord centralisé",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Système sécurisé avec QR codes uniques par table",
    color: "primary",
  },
  {
    icon: TrendingUp,
    title: "Augmentez vos ventes",
    description: "Menu digital attractif qui encourage les commandes",
    color: "secondary",
  },
  {
    icon: Users,
    title: "Expérience client",
    description: "Offrez une expérience moderne et interactive à vos clients",
    color: "accent",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pourquoi choisir Tara ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une solution complète pour moderniser votre restaurant
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const bgColor = feature.color === 'primary' 
              ? 'bg-primary/10' 
              : feature.color === 'secondary' 
              ? 'bg-secondary/10' 
              : 'bg-accent/10';
            const textColor = feature.color === 'primary' 
              ? 'text-primary' 
              : feature.color === 'secondary' 
              ? 'text-secondary' 
              : 'text-accent';
            
            return (
              <Card 
                key={feature.title} 
                className="hover:shadow-large transition-smooth border-2 hover:border-primary/20"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${textColor}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
