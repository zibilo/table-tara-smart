import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SelectedOption } from "@/pages/Menu";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  comment?: string;
  selectedOptions?: SelectedOption[];
}

interface CartSheetProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem: (itemIndex: number, quantity: number, comment?: string) => void;
  onRemoveItem: (itemIndex: number) => void;
}

const CartSheet = ({
  cart,
  isOpen,
  onClose,
  onUpdateItem,
  onRemoveItem,
}: CartSheetProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getItemTotal = (item: CartItem) => {
    const basePrice = item.price;
    const optionsPrice = item.selectedOptions?.reduce(
      (sum, opt) => sum + opt.priceModifier,
      0
    ) || 0;
    return (basePrice + optionsPrice) * item.quantity;
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des plats avant de valider",
        variant: "destructive",
      });
      return;
    }

    const tableId = sessionStorage.getItem("tableId");
    if (!tableId) {
      toast({
        title: "Erreur",
        description: "Session expirée, veuillez rescanner le QR code",
        variant: "destructive",
      });
      navigate("/table-scan");
      return;
    }

    setIsSubmitting(true);

    try {
      const total = getTotal();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_id: tableId,
          total: total,
          status: "received",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        dish_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: getItemTotal(item),
        comment: item.comment || null,
        options_selected: item.selectedOptions ? JSON.parse(JSON.stringify(item.selectedOptions)) : [],
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Commande envoyée !",
        description: "Votre commande a été transmise à la cuisine",
      });

      // Navigate to confirmation
      navigate("/order-confirmation", { state: { orderId: order.id } });
      onClose();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la commande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Votre Panier
          </SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? "Votre panier est vide"
              : `${cart.length} article(s)`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucun plat sélectionné</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toFixed(2)} € × {item.quantity}
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.selectedOptions.map((opt, optIdx) => (
                            <div key={optIdx} className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>• {opt.optionName}</span>
                              {opt.priceModifier !== 0 && (
                                <span className="text-primary">
                                  ({opt.priceModifier > 0 ? "+" : ""}
                                  {opt.priceModifier.toFixed(2)} €)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {getItemTotal(item).toFixed(2)} €
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onUpdateItem(index, item.quantity - 1, item.comment)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem(
                          index,
                          parseInt(e.target.value) || 1,
                          item.comment
                        )
                      }
                      className="h-8 w-16 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onUpdateItem(index, item.quantity + 1, item.comment)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 ml-auto"
                      onClick={() => onRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Commentaire (ex: sans oignon, bien cuit...)"
                    value={item.comment || ""}
                    onChange={(e) =>
                      onUpdateItem(index, item.quantity, e.target.value)
                    }
                    className="min-h-[60px] text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{getTotal().toFixed(2)} €</span>
            </div>
            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full h-12 text-lg"
            >
              {isSubmitting ? "Envoi..." : "Valider la commande"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
