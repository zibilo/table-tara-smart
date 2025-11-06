import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Sparkles, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DishCustomizationDialogKids from "@/components/DishCustomizationDialogKids";
import CartSheet from "@/components/CartSheet";
import { CartItem, SelectedOption } from "@/pages/Menu";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

const MenuKids = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const tableNumber = sessionStorage.getItem("tableNumber");
  const restaurantId = sessionStorage.getItem("restaurantId");

  const categoryColors = {
    "hamburger": "from-[#FFD700] to-[#FFA500]",
    "pizza": "from-[#90EE90] to-[#32CD32]", 
    "gâteau": "from-[#FFB6C1] to-[#FF69B4]",
    "boisson": "from-[#87CEEB] to-[#4682B4]",
  };

  const categoryBorders = {
    "hamburger": "border-[#8B4513]",
    "pizza": "border-[#DC143C]",
    "gâteau": "border-[#9370DB]",
    "boisson": "border-[#4682B4]",
  };

  useEffect(() => {
    if (!tableNumber || !restaurantId) {
      toast({
        title: "Erreur",
        description: "Veuillez scanner le QR code de votre table",
        variant: "destructive",
      });
      navigate("/table-scan");
      return;
    }
    fetchDishes();
  }, [restaurantId]);

  const fetchDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .eq("is_available", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le menu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsCustomizationOpen(true);
  };

  const addToCart = (
    dish: Dish,
    selectedOptions: SelectedOption[] = [],
    comment: string = ""
  ) => {
    setCart((prev) => [
      ...prev,
      {
        ...dish,
        quantity: 1,
        selectedOptions,
        comment: comment || undefined,
      },
    ]);

    toast({
      title: "Ajouté au panier",
      description: `${dish.name} a été ajouté`,
    });
  };

  const updateCartItem = (itemIndex: number, quantity: number, comment?: string) => {
    if (quantity === 0) {
      setCart((prev) => prev.filter((_, idx) => idx !== itemIndex));
    } else {
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === itemIndex ? { ...item, quantity, comment } : item
        )
      );
    }
  };

  const removeFromCart = (itemIndex: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== itemIndex));
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCategoryKey = (category: string): keyof typeof categoryColors => {
    const normalized = category.toLowerCase();
    if (normalized.includes("burger")) return "hamburger";
    if (normalized.includes("pizza")) return "pizza";
    if (normalized.includes("gâteau") || normalized.includes("dessert")) return "gâteau";
    if (normalized.includes("boisson")) return "boisson";
    return "hamburger";
  };

  const categories = [...new Set(dishes.map((dish) => dish.category))];

  return (
    <div className="min-h-screen kawaii-gradient pb-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 animate-bounce">
        <Cloud className="w-16 h-16 text-white/80" />
      </div>
      <div className="absolute top-20 right-10 animate-bounce delay-100">
        <Cloud className="w-12 h-12 text-white/80" />
      </div>
      <div className="absolute top-40 right-32 animate-pulse">
        <Star className="w-8 h-8 text-yellow-300" fill="currentColor" />
      </div>
      <div className="absolute top-32 left-32 animate-pulse delay-75">
        <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
      </div>
      <div className="absolute top-60 left-20 animate-pulse delay-150">
        <Sparkles className="w-6 h-6 text-pink-300" />
      </div>

      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-full inline-block px-8 py-3 shadow-lg transform -rotate-2 mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              MA COMMANDE MAGIQUE ✨
            </h1>
          </div>
          <div className="text-6xl mb-2">👨‍🍳</div>
          <p className="text-white font-semibold">Table {tableNumber}</p>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white font-semibold text-lg">Chargement du menu magique...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {categories.map((category) => {
              const categoryKey = getCategoryKey(category);
              const dish = dishes.find((d) => d.category === category);
              if (!dish) return null;

              return (
                <button
                  key={category}
                  onClick={() => handleDishClick(dish)}
                  className="group"
                >
                  <div className="relative">
                    <div className={`w-full aspect-square rounded-full bg-gradient-to-br ${categoryColors[categoryKey]} p-2 border-8 ${categoryBorders[categoryKey]} shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center text-7xl">
                        {categoryKey === "hamburger" && "🍔"}
                        {categoryKey === "pizza" && "🍕"}
                        {categoryKey === "gâteau" && "🧁"}
                        {categoryKey === "boisson" && "🥤"}
                      </div>
                    </div>
                    <div className="mt-3 bg-white rounded-full px-4 py-2 shadow-lg">
                      <p className="font-bold text-lg text-orange-600 uppercase">
                        {category}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
          <Button
            onClick={() => setIsCartOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all hover:scale-105"
          >
            <ShoppingCart className="h-6 w-6 mr-3" />
            VOIR MON PANIER 🛒
            <span className="ml-3 bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center">
              {getTotalItems()}
            </span>
          </Button>
        </div>
      )}

      {/* Customization Dialog */}
      <DishCustomizationDialogKids
        dish={selectedDish}
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        onAddToCart={addToCart}
      />

      {/* Cart Sheet */}
      <CartSheet
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateItem={updateCartItem}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};

export default MenuKids;
