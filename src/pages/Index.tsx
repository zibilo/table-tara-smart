import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, UtensilsCrossed, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <Features />
        
        {/* Quick Action Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                Commencez votre expérience
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-8 shadow-medium hover:shadow-large transition-shadow">
                  <QrCode className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Scanner le QR Code</h3>
                  <p className="text-muted-foreground mb-4">
                    Scannez le code QR de votre table pour accéder au menu
                  </p>
                  <Button
                    onClick={() => navigate("/table-scan")}
                    className="w-full"
                    size="lg"
                  >
                    Scanner maintenant
                  </Button>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-medium hover:shadow-large transition-shadow">
                  <div className="flex gap-2 mb-4">
                    <UtensilsCrossed className="h-12 w-12 text-primary" />
                    <Sparkles className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Menu Enfants Magique</h3>
                  <p className="text-muted-foreground mb-4">
                    Une expérience ludique et colorée pour les enfants
                  </p>
                  <Button
                    onClick={() => {
                      sessionStorage.setItem("tableNumber", "1");
                      sessionStorage.setItem("restaurantId", "demo");
                      navigate("/menu-kids");
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    Voir le menu enfants ✨
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
