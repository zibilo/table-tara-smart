import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";


interface Category {
  id: string;
  name: string;
  emoji: string | null;
}

interface CategoryOptionGroup {
  id: string;
  category: string;
  name: string;
  selection_type: string;
  is_required: boolean;
  display_order: number;
  enable_description: boolean | null;
  created_at: string;
}

interface CategoryOption {
  id: string;
  option_group_id: string;
  name: string;
  extra_price: number;
  display_order: number;
  created_at: string;
}

export default function OptionsManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [optionGroups, setOptionGroups] = useState<CategoryOptionGroup[]>([]);
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryOptionGroup | null>(null);
  const [editingOption, setEditingOption] = useState<CategoryOption | null>(null);
  
  const [groupForm, setGroupForm] = useState({
    name: "",
    selection_type: "single",
    is_required: false,
  });

  const [optionForm, setOptionForm] = useState({
    option_group_id: "",
    name: "",
    extra_price: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchOptionGroups();
    fetchOptions();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories" as any).select("*");
    if (data) setCategories(data as unknown as Category[]);
  };

  const fetchOptionGroups = async () => {
    const { data } = await supabase
      .from("category_option_groups" as any)
      .select("*")
      .order("display_order");
    if (data) setOptionGroups(data as unknown as CategoryOptionGroup[]);
  };

  const fetchOptions = async () => {
    const { data } = await supabase
      .from("category_options" as any)
      .select("*")
      .order("display_order");
    if (data) setOptions(data as unknown as CategoryOption[]);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const data = {
        category: selectedCategory,
        name: groupForm.name,
        selection_type: groupForm.selection_type,
        is_required: groupForm.is_required,
        display_order: 0,
      };

      if (editingGroup) {
        const { error } = await supabase
          .from("category_option_groups" as any)
          .update(data)
          .eq("id", editingGroup.id);
        if (error) throw error;
        toast.success("Groupe modifié");
      } else {
        const { error } = await supabase
          .from("category_option_groups" as any)
          .insert(data);
        if (error) throw error;
        toast.success("Groupe créé");
      }

      setDialogOpen(false);
      resetGroupForm();
      fetchOptionGroups();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        option_group_id: optionForm.option_group_id,
        name: optionForm.name,
        extra_price: parseFloat(optionForm.extra_price),
        display_order: 0,
      };

      if (editingOption) {
        const { error } = await supabase
          .from("category_options" as any)
          .update(data)
          .eq("id", editingOption.id);
        if (error) throw error;
        toast.success("Option modifiée");
      } else {
        const { error } = await supabase
          .from("category_options" as any)
          .insert(data);
        if (error) throw error;
        toast.success("Option créée");
      }

      setOptionDialogOpen(false);
      resetOptionForm();
      fetchOptions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetGroupForm = () => {
    setEditingGroup(null);
    setGroupForm({
      name: "",
      selection_type: "single",
      is_required: false,
    });
  };

  const resetOptionForm = () => {
    setEditingOption(null);
    setOptionForm({
      option_group_id: "",
      name: "",
      extra_price: "",
    });
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Supprimer ce groupe ?")) return;
    const { error } = await supabase
      .from("category_option_groups" as any)
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Groupe supprimé");
      fetchOptionGroups();
    }
  };

  const deleteOption = async (id: string) => {
    if (!confirm("Supprimer cette option ?")) return;
    const { error } = await supabase
      .from("category_options" as any)
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Option supprimée");
      fetchOptions();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Options</h2>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Groupe d'options
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau groupe d'options</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
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
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Type de sélection</Label>
                  <Select
                    value={groupForm.selection_type}
                    onValueChange={(value) => setGroupForm({ ...groupForm, selection_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Choix unique</SelectItem>
                      <SelectItem value="multiple">Choix multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={groupForm.is_required}
                    onCheckedChange={(checked) =>
                      setGroupForm({ ...groupForm, is_required: checked })
                    }
                  />
                  <Label>Obligatoire</Label>
                </div>
                <Button type="submit" className="w-full">Créer</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Option
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle option</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleOptionSubmit} className="space-y-4">
                <div>
                  <Label>Groupe</Label>
                  <Select
                    value={optionForm.option_group_id}
                    onValueChange={(value) =>
                      setOptionForm({ ...optionForm, option_group_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.category} - {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={optionForm.name}
                    onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Prix supplémentaire (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={optionForm.extra_price}
                    onChange={(e) => setOptionForm({ ...optionForm, extra_price: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Créer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {optionGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {group.category} - {group.name}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => deleteGroup(group.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {options
                  .filter((opt) => opt.option_group_id === group.id)
                  .map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{option.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          +{Number(option.extra_price).toFixed(2)}€
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
