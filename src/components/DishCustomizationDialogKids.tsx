import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface DishOption {
  id: string;
  name: string;
  price_modifier: number;
}

interface DishOptionGroup {
  id: string;
  name: string;
  is_required: boolean;
  allow_multiple: boolean;
  options: DishOption[];
}

interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceModifier: number;
}

interface DishCustomizationDialogKidsProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: Dish, selectedOptions: SelectedOption[], comment: string) => void;
}

const optionEmojis: Record<string, string> = {
  "pain brioché": "🥖",
  "pain céréales": "🌾",
  "sans gluten": "🥬",
  "ketchup": "🍅",
  "mayonnaise": "🥚",
  "sauce bbq": "🍖",
};

const DishCustomizationDialogKids = ({
  dish,
  isOpen,
  onClose,
  onAddToCart,
}: DishCustomizationDialogKidsProps) => {
  const [optionGroups, setOptionGroups] = useState<DishOptionGroup[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dish && isOpen) {
      fetchOptionGroups();
      setSelectedOptions([]);
      setComment("");
    }
  }, [dish, isOpen]);

  const fetchOptionGroups = async () => {
    if (!dish) return;

    setIsLoading(true);
    try {
      const { data: groups, error: groupsError } = await supabase
        .from("dish_option_groups")
        .select("*")
        .eq("dish_id", dish.id)
        .order("display_order");

      if (groupsError) throw groupsError;

      if (groups && groups.length > 0) {
        const groupsWithOptions = await Promise.all(
          groups.map(async (group) => {
            const { data: options, error: optionsError } = await supabase
              .from("dish_options")
              .select("*")
              .eq("option_group_id", group.id)
              .order("display_order");

            if (optionsError) throw optionsError;

            return {
              ...group,
              options: options || [],
            };
          })
        );

        setOptionGroups(groupsWithOptions);
      } else {
        setOptionGroups([]);
      }
    } catch (error) {
      console.error("Error fetching option groups:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les options",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionToggle = (group: DishOptionGroup, option: DishOption, checked: boolean) => {
    if (checked) {
      if (group.allow_multiple) {
        setSelectedOptions([
          ...selectedOptions,
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceModifier: option.price_modifier,
          },
        ]);
      } else {
        setSelectedOptions([
          ...selectedOptions.filter((opt) => opt.groupId !== group.id),
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceModifier: option.price_modifier,
          },
        ]);
      }
    } else {
      setSelectedOptions(selectedOptions.filter((opt) => opt.optionId !== option.id));
    }
  };

  const isGroupValid = (group: DishOptionGroup) => {
    if (!group.is_required) return true;
    return selectedOptions.some((opt) => opt.groupId === group.id);
  };

  const canAddToCart = () => {
    return optionGroups.every((group) => isGroupValid(group));
  };

  const getTotalPrice = () => {
    if (!dish) return 0;
    const basePrice = dish.price;
    const modifiersTotal = selectedOptions.reduce(
      (sum, opt) => sum + opt.priceModifier,
      0
    );
    return basePrice + modifiersTotal;
  };

  const handleAddToCart = () => {
    if (!dish) return;
    if (!canAddToCart()) {
      toast({
        title: "Options manquantes",
        description: "Veuillez sélectionner toutes les options obligatoires",
        variant: "destructive",
      });
      return;
    }

    onAddToCart(dish, selectedOptions, comment);
    onClose();
  };

  const getOptionEmoji = (optionName: string) => {
    const normalized = optionName.toLowerCase();
    return optionEmojis[normalized] || "⭐";
  };

  if (!dish) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto kawaii-gradient border-8 border-white p-0">
        <div className="relative p-8">
          {/* Decorative elements */}
          <Star className="absolute top-4 right-4 w-6 h-6 text-yellow-300 animate-pulse" fill="currentColor" />
          <Sparkles className="absolute top-4 left-4 w-6 h-6 text-pink-300 animate-pulse" />
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-white rounded-full inline-block px-6 py-2 shadow-lg mb-4 transform -rotate-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
                MON SUPER {dish.name.toUpperCase()} 🍔
              </h2>
            </div>
            <div className="text-5xl mb-2">👨‍🍳</div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <p className="text-center text-white font-semibold">Chargement des options...</p>
            ) : optionGroups.length === 0 ? (
              <p className="text-center text-white font-semibold">
                Aucune option disponible
              </p>
            ) : (
              optionGroups.map((group) => (
                <div key={group.id} className="kawaii-card p-6">
                  <h3 className="font-bold text-xl mb-4 text-center text-amber-900 uppercase">
                    {group.name} :
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions.some(
                        (opt) => opt.optionId === option.id
                      );

                      return (
                        <div key={option.id} className="flex flex-col items-center">
                          <button
                            onClick={() =>
                              handleOptionToggle(group, option, !isSelected)
                            }
                            className={`relative w-full aspect-square rounded-full p-2 transition-all duration-300 ${
                              isSelected
                                ? "bg-gradient-to-br from-green-300 to-green-400 border-4 border-green-600 scale-105"
                                : "bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                                <Sparkles className="w-5 h-5 text-green-600" fill="currentColor" />
                              </div>
                            )}
                            <div className="w-full h-full rounded-full bg-white/50 flex items-center justify-center text-5xl">
                              {getOptionEmoji(option.name)}
                            </div>
                          </button>
                          <div className="mt-2 bg-white rounded-full px-3 py-1 shadow">
                            <p className="font-semibold text-sm text-amber-900 uppercase text-center">
                              {option.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            <div className="kawaii-card p-6">
              <Textarea
                placeholder="NOTES SPÉCIALES..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="text-lg border-4 border-gray-300 rounded-2xl focus:border-purple-400 text-gray-600 placeholder:text-gray-400"
                rows={3}
              />
            </div>
          </div>

          {/* Add to cart button */}
          <div className="mt-6">
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl py-6 rounded-full shadow-2xl transform transition-all hover:scale-105 disabled:opacity-50"
            >
              🛒 AJOUTER AU PANIER 🛒
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishCustomizationDialogKids;
