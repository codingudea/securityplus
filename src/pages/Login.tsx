import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { User, Lock, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Completa todos los campos", "error");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      showToast("Inicio de sesión exitoso", "success");
      if (email === "admin@test.com") {
        navigate("/admin/dashboard");
      } else {
        navigate("/empresa/mis-diagnosticos");
      }
    } else {
      showToast(result.error || "Error al iniciar sesión", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md animate-scale-in border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Usuarios de prueba:
              </p>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="hover:text-primary transition-colors"
                  onClick={() => {
                    setEmail("admin@test.com");
                    setPassword("123456");
                  }}
                >
                  Admin: admin@test.com / 123456
                </button>
                <button
                  type="button"
                  className="hover:text-primary transition-colors"
                  onClick={() => {
                    setEmail("empresa@test.com");
                    setPassword("123456");
                  }}
                >
                  Empresa: empresa@test.com / 123456
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Volver al inicio
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
