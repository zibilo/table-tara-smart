import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type OrderStatus = "received" | "preparing" | "ready" | "served" | "paid";

interface Order {
  id: string;
  table_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    comment: string | null;
    options_selected: any;
    dishes: {
      name: string;
    };
  }>;
  tables: {
    table_number: number;
  };
}

const statusColors = {
  received: "bg-blue-500",
  preparing: "bg-yellow-500",
  ready: "bg-green-500",
  served: "bg-purple-500",
  paid: "bg-gray-500",
};

const statusLabels = {
  received: "Reçue",
  preparing: "En préparation",
  ready: "Prête",
  served: "Servie",
  paid: "Payée",
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            dishes (name)
          ),
          tables (table_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchOrders();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
        <Badge variant="secondary">{orders.length} commandes</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Table {order.tables.table_number}
                </CardTitle>
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(order.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.dishes.name}
                    </span>
                    <span>{item.subtotal.toFixed(2)}€</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{order.total.toFixed(2)}€</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {order.status === "received" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                  >
                    En préparation
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "ready")}
                  >
                    Prête
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "served")}
                  >
                    Servie
                  </Button>
                )}
                {order.status === "served" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "paid")}
                  >
                    Payée
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
