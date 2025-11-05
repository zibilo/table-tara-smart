import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, UtensilsCrossed, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        
        {/* Quick Action Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Commandez en un instant</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Scannez le QR code sur votre table pour accéder au menu et passer votre commande directement
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/table-scan")}
              className="h-14 px-8 text-lg"
            >
              <QrCode className="mr-2 h-5 w-5" />
              Commencer une commande
            </Button>
          </div>
        </section>

        <MenuSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
