import { Button } from "@/components/ui/button";
import { QrCode, Smartphone, Zap } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
      
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-gradient-warm text-primary-foreground rounded-full text-sm font-semibold shadow-soft">
                🍽️ La solution digitale pour votre restaurant
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Commandez en <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                un instant
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Scannez, choisissez, commandez. Tara révolutionne l'expérience de commande en restaurant avec une interface intuitive et rapide.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg">
                Découvrir le menu
              </Button>
              <Button variant="outline" size="lg">
                En savoir plus
              </Button>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Scan QR Code</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm font-medium">Menu digital</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium">Service rapide</p>
              </div>
            </div>
          </div>
          
          {/* Right image */}
          <div className="relative lg:ml-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-large">
              <img 
                src={heroImage} 
                alt="Plat gastronomique" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-large border border-border max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-fresh flex items-center justify-center text-secondary-foreground font-bold text-lg">
                  ✓
                </div>
                <div>
                  <p className="font-semibold">Commande validée</p>
                  <p className="text-sm text-muted-foreground">Table 7 • 34€</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
