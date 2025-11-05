import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      navigate("/table-scan");
    }
  }, [orderId, navigate]);

  const handleNewOrder = () => {
    navigate("/menu");
  };

  const handleGoHome = () => {
    sessionStorage.clear();
    navigate("/table-scan");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-secondary" />
          </div>
          <CardTitle className="text-3xl">Commande validée !</CardTitle>
          <CardDescription className="text-base">
            Votre commande a été transmise à la cuisine. Elle sera servie dans quelques instants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Numéro de commande
            </p>
            <p className="font-mono font-bold text-lg">
              {orderId?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={handleNewOrder} className="w-full h-12">
              Commander d'autres plats
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full h-12"
            >
              <Home className="mr-2 h-4 w-4" />
              Terminer
            </Button>
          </div>

          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-center">
              💡 <strong>Bon appétit !</strong> Le personnel sera notifié dès que vous souhaiterez régler l'addition.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
