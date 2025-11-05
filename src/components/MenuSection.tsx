import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star } from "lucide-react";
import { useState } from "react";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
}

const SAMPLE_DISHES: Dish[] = [
  {
    id: "1",
    name: "Burger Classique",
    description: "Pain brioché, steak haché 180g, cheddar, salade, tomate, sauce maison",
    price: 12,
    category: "Plats",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Salade César",
    description: "Laitue romaine, poulet grillé, parmesan, croûtons, sauce César",
    price: 10,
    category: "Entrées",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Pizza Margherita",
    description: "Sauce tomate, mozzarella, basilic frais, huile d'olive",
    price: 11,
    category: "Plats",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Tiramisu Maison",
    description: "Biscuits imbibés de café, mascarpone, cacao",
    price: 6,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
    rating: 4.9,
  },
];

const MenuSection = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  
  const addToCart = (dishId: string) => {
    setCart(prev => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
  };
  
  const cartTotal = Object.entries(cart).reduce((total, [dishId, quantity]) => {
    const dish = SAMPLE_DISHES.find(d => d.id === dishId);
    return total + (dish?.price || 0) * quantity;
  }, 0);
  
  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <section id="menu" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-fresh text-secondary-foreground">
            Notre Menu
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Découvrez nos plats
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une sélection de plats préparés avec des ingrédients frais et de qualité
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {SAMPLE_DISHES.map((dish) => (
            <Card key={dish.id} className="overflow-hidden hover:shadow-large transition-smooth group">
              <div className="relative overflow-hidden h-48">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                {dish.rating && (
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span className="text-xs font-semibold">{dish.rating}</span>
                  </div>
                )}
                <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm">
                  {dish.category}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{dish.name}</CardTitle>
                <CardDescription>{dish.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{dish.price}€</span>
                <Button 
                  size="sm" 
                  onClick={() => addToCart(dish.id)}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Cart summary */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
            <Card className="shadow-large border-2 border-primary/20">
              <CardContent className="flex items-center gap-6 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-bold">
                    {cartItemCount}
                  </div>
                  <div>
                    <p className="font-semibold">Panier</p>
                    <p className="text-sm text-muted-foreground">{cartTotal}€ total</p>
                  </div>
                </div>
                <Button variant="hero" size="lg">
                  Valider la commande
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
