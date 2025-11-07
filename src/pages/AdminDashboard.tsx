import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingBag, UtensilsCrossed, Settings, Users, Table } from "lucide-react";
import { toast } from "sonner";
import OrdersManagement from "@/components/admin/OrdersManagement";
import DishesManagement from "@/components/admin/DishesManagement";
import TablesManagement from "@/components/admin/TablesManagement";
import OptionsManagement from "@/components/admin/OptionsManagement";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "manager", "server"])
        .single();

      if (!roleData) {
        toast.error("Accès non autorisé");
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setUserRole(roleData.role);
    } catch (error) {
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panneau d'Administration</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Rôle: <span className="font-medium capitalize">{userRole}</span>
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="dishes">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Plats
            </TabsTrigger>
            <TabsTrigger value="options">
              <Settings className="h-4 w-4 mr-2" />
              Options
            </TabsTrigger>
            <TabsTrigger value="tables">
              <Table className="h-4 w-4 mr-2" />
              Tables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="dishes">
            <DishesManagement />
          </TabsContent>

          <TabsContent value="options">
            <OptionsManagement />
          </TabsContent>

          <TabsContent value="tables">
            <TablesManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
