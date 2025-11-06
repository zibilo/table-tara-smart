import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
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

interface DishCustomizationDialogProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: Dish, selectedOptions: SelectedOption[], comment: string) => void;
}

const DishCustomizationDialog = ({
  dish,
  isOpen,
  onClose,
  onAddToCart,
}: DishCustomizationDialogProps) => {
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

  const handleRadioChange = (group: DishOptionGroup, optionId: string) => {
    const option = group.options.find((opt) => opt.id === optionId);
    if (!option) return;

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

  if (!dish) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{dish.name}</DialogTitle>
          {dish.description && (
            <p className="text-muted-foreground">{dish.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Chargement des options...</p>
          ) : optionGroups.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Aucune option de personnalisation disponible
            </p>
          ) : (
            optionGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  {group.is_required && (
                    <Badge variant="destructive" className="text-xs">
                      Obligatoire
                    </Badge>
                  )}
                  {group.allow_multiple && (
                    <Badge variant="secondary" className="text-xs">
                      Choix multiple
                    </Badge>
                  )}
                </div>

                {group.allow_multiple ? (
                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${option.id}`}
                          checked={selectedOptions.some(
                            (opt) => opt.optionId === option.id
                          )}
                          onCheckedChange={(checked) =>
                            handleOptionToggle(group, option, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`option-${option.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option.name}
                          {option.price_modifier !== 0 && (
                            <span className="ml-2 text-muted-foreground">
                              ({option.price_modifier > 0 ? "+" : ""}
                              {option.price_modifier.toFixed(2)} €)
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={
                      selectedOptions.find((opt) => opt.groupId === group.id)
                        ?.optionId || ""
                    }
                    onValueChange={(value) => handleRadioChange(group, value)}
                  >
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`radio-${option.id}`} />
                        <Label
                          htmlFor={`radio-${option.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option.name}
                          {option.price_modifier !== 0 && (
                            <span className="ml-2 text-muted-foreground">
                              ({option.price_modifier > 0 ? "+" : ""}
                              {option.price_modifier.toFixed(2)} €)
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Notes spéciales (facultatif)</Label>
            <Textarea
              id="comment"
              placeholder="Ex: Sans oignons, cuisson bien cuite..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-lg font-bold">
            Total: {getTotalPrice().toFixed(2)} €
          </div>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleAddToCart} disabled={!canAddToCart()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DishCustomizationDialog;
