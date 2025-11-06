import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DishCard from "@/components/DishCard";
import CartSheet from "@/components/CartSheet";
import DishCustomizationDialog from "@/components/DishCustomizationDialog";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceModifier: number;
}

export interface CartItem extends Dish {
  quantity: number;
  comment?: string;
  selectedOptions?: SelectedOption[];
}

const Menu = () => {
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

  useEffect(() => {
    // Check if table is set
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

  const categories = [...new Set(dishes.map((dish) => dish.category))];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/table-scan")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold">Notre Menu</h1>
            <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Panier
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement du menu...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <section key={category}>
                <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dishes
                    .filter((dish) => dish.category === category)
                    .map((dish) => (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        onAddToCart={handleDishClick}
                      />
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Customization Dialog */}
      <DishCustomizationDialog
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

export default Menu;
