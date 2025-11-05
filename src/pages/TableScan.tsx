import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TableScan = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro de table",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const { data: table, error } = await supabase
        .from("tables")
        .select("id, table_number, restaurant_id, is_active")
        .eq("table_number", parseInt(tableNumber))
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!table) {
        toast({
          title: "Table introuvable",
          description: "Ce numéro de table n'existe pas ou n'est pas active",
          variant: "destructive",
        });
        setIsValidating(false);
        return;
      }

      // Store table info in sessionStorage
      sessionStorage.setItem("tableId", table.id);
      sessionStorage.setItem("tableNumber", table.table_number.toString());
      sessionStorage.setItem("restaurantId", table.restaurant_id);

      toast({
        title: "Table validée !",
        description: `Bienvenue à la table ${table.table_number}`,
      });

      // Navigate to menu
      navigate("/menu");
    } catch (error) {
      console.error("Error validating table:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <QrCode className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Bienvenue !</CardTitle>
          <CardDescription className="text-base">
            Entrez le numéro de votre table pour commencer votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTableSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="tableNumber" className="text-sm font-medium">
                Numéro de table
              </label>
              <Input
                id="tableNumber"
                type="number"
                placeholder="Ex: 5"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="text-lg h-12"
                min="1"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isValidating}
            >
              {isValidating ? "Validation..." : "Continuer"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              💡 Le numéro de table est indiqué sur votre QR code
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableScan;
