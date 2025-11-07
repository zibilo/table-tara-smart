import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, QrCode } from "lucide-react";

interface Table {
  id: string;
  table_number: number;
  qr_code_data: string;
  is_active: boolean;
}

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const { data } = await supabase
      .from("tables")
      .select("*")
      .order("table_number");
    setTables(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const qrData = `table-${tableNumber}`;
      const { error } = await supabase.from("tables").insert({
        table_number: parseInt(tableNumber),
        qr_code_data: qrData,
        is_active: true,
        restaurant_id: "00000000-0000-0000-0000-000000000000",
      });

      if (error) throw error;
      toast.success("Table créée");
      setDialogOpen(false);
      setTableNumber("");
      fetchTables();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("tables")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Table mise à jour");
      fetchTables();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Tables</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une table</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="number">Numéro de table</Label>
                <Input
                  id="number"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Créer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Table {table.table_number}</span>
                <QrCode className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor={`active-${table.id}`}>Active</Label>
                <Switch
                  id={`active-${table.id}`}
                  checked={table.is_active}
                  onCheckedChange={() => toggleActive(table.id, table.is_active)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                QR: {table.qr_code_data}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
