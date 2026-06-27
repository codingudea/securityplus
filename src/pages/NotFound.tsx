import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="text-center animate-scale-in">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Página no encontrada
        </p>
        <Button onClick={() => navigate("/")} size="lg">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
