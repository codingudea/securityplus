import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { User, Lock, ArrowLeft, Rocket } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleMsg, setShowGoogleMsg] = useState(false);

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

            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                o
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleMsg(true)}
              className="flex items-center justify-center gap-3 w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.359 L -10.684 60.099 L -6.824 60.099 C -4.564 58.039 -3.264 55.089 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.099 L -10.684 57.359 C -11.764 58.099 -13.134 58.559 -14.754 58.559 C -17.884 58.559 -20.534 56.469 -21.484 53.609 L -25.464 53.609 L -25.464 56.239 C -23.494 60.189 -19.434 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.609 C -21.734 52.959 -21.864 52.249 -21.864 51.509 C -21.864 50.769 -21.724 50.059 -21.484 49.409 L -21.484 46.779 L -25.464 46.779 C -26.284 48.449 -26.754 50.299 -26.754 51.509 C -26.754 52.719 -26.284 54.569 -25.464 56.239 L -21.484 53.609 Z"/>
                  <path fill="#EA4335" d="M -14.754 44.429 C -13.024 44.429 -11.484 45.079 -10.274 46.209 L -6.934 42.869 C -8.804 41.159 -11.514 40.229 -14.754 40.229 C -19.434 40.229 -23.494 43.279 -25.464 47.219 L -21.484 49.809 C -20.534 46.949 -17.884 44.429 -14.754 44.429 Z"/>
                </g>
              </svg>
              Iniciar sesión con Google
            </button>

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

      <Dialog open={showGoogleMsg} onOpenChange={setShowGoogleMsg}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-6 w-6 text-blue-500" />
              ¡Grandes cosas vienen!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              El inicio de sesión con Google estará disponible en la versión Premium.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mientras tanto, utiliza los usuarios de prueba para explorar la plataforma.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium text-primary">
              ¡Cuando ganemos la hackathon, este proyecto será llevado a su máximo potencial! 🚀
            </p>
            <Button
              onClick={() => setShowGoogleMsg(false)}
              className="w-full"
              size="lg"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
