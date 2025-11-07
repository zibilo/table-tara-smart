import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Dish = Tables<"dishes">;

interface Category {
  id: string;
  name: string;
  emoji: string | null;
  display_order: number | null;
  created_at: string | null;
}

export default function DishesManagement() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_available: true,
  });

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  const fetchDishes = async () => {
    const { data } = await supabase
      .from("dishes")
      .select("*")
      .order("category", { ascending: true });
    if (data) setDishes(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories" as any)
      .select("*")
      .order("display_order", { ascending: true });
    if (data) setCategories(data as unknown as Category[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dishData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category,
        is_available: formData.is_available,
        restaurant_id: "00000000-0000-0000-0000-000000000000",
      };

      if (editingDish) {
        const { error } = await supabase
          .from("dishes")
          .update(dishData)
          .eq("id", editingDish.id);
        if (error) throw error;
        toast.success("Plat modifié");
      } else {
        const { error } = await supabase
          .from("dishes")
          .insert(dishData);
        if (error) throw error;
        toast.success("Plat créé");
      }

      setDialogOpen(false);
      resetForm();
      fetchDishes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || "",
      price: Number(dish.price).toString(),
      category: dish.category,
      is_available: dish.is_available ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce plat ?")) return;
    
    try {
      const { error } = await supabase
        .from("dishes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Plat supprimé");
      fetchDishes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingDish(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      is_available: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Plats</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Plat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDish ? "Modifier le plat" : "Nouveau plat"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_available: checked })
                  }
                />
                <Label htmlFor="available">Disponible</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingDish ? "Modifier" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish) => (
          <Card key={dish.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{dish.name}</span>
                {!dish.is_available && (
                  <span className="text-xs text-muted-foreground">Indisponible</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{dish.description}</p>
              <p className="font-bold mb-2">{Number(dish.price).toFixed(2)}€</p>
              <p className="text-sm text-muted-foreground mb-4">Catégorie: {dish.category}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(dish)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(dish.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
