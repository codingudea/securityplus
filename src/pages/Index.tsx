import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen, ClipboardCheck, User, Scale, Shield, FileText, Eye, Lock } from "lucide-react";

const informacionLey = {
  queEs: "La Ley 1581 de 2012 establece las disposiciones generales para la protección de datos personales en Colombia. Regula el derecho fundamental al habeas data y el tratamiento de datos personales por parte de responsables y encargados.",
  objetivo: "Garantizar el derecho constitucional que tienen todas las personas a conocer, actualizar y rectificar la información que se haya recogido sobre ellas en bases de datos o archivos, y los demás derechos, libertades y garantías constitucionales.",
  principios: [
    "Principio de Legalidad: El tratamiento debe sujetarse a lo establecido en la ley.",
    "Principio de Finalidad: El tratamiento debe obedecer a una finalidad legítima.",
    "Principio de Libertad: El tratamiento requiere autorización previa e informada del titular.",
    "Principio de Veracidad: La información debe ser veraz, completa y actualizada.",
    "Principio de Transparencia: El titular debe poder obtener información sobre sus datos.",
    "Principio de Acceso y Circulación Restringida: Solo personas autorizadas pueden acceder.",
    "Principio de Seguridad: Se deben adoptar medidas de seguridad técnicas y organizativas.",
    "Principio de Confidencialidad: Todos los intervinientes están obligados a la confidencialidad.",
  ],
  derechos: [
    "Conocer, actualizar y rectificar sus datos personales.",
    "Solicitar prueba de la autorización otorgada.",
    "Ser informado sobre el uso de sus datos.",
    "Presentar quejas ante la Superintendencia de Industria y Comercio.",
    "Revocar la autorización y/o solicitar la supresión del dato.",
    "Acceder gratuitamente a sus datos personales.",
  ],
  obligaciones: [
    "Obtener autorización del titular para el tratamiento de datos.",
    "Implementar políticas de tratamiento de datos.",
    "Atender consultas y reclamos en los términos establecidos.",
    "Registrar las bases de datos ante la SIC.",
    "Adoptar medidas de seguridad apropiadas.",
    "No divulgar información sin autorización.",
    "Designar un oficial de protección de datos.",
  ],
};

const Index = () => {
  const navigate = useNavigate();
  const [showLeyModal, setShowLeyModal] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0A0F2B_0%,#072177_50%,#0A0F2B_100%)]" />
        <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="animate-slide-up max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm mb-8">
              <Scale className="h-4 w-4" />
              <span>Protección de Datos Personales</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Diagnóstico de Cumplimiento de la{" "}
              <span className="text-blue-300">Ley 1581 de 2012</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Conozca el nivel de cumplimiento de su empresa frente a la normativa
              colombiana de protección de datos personales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold shadow-lg"
                onClick={() => navigate("/diagnostico")}
              >
                <ClipboardCheck className="h-5 w-5" />
                Iniciar Diagnóstico
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                <User className="h-5 w-5" />
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Cards */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Ley 1581 */}
          <Card className="animate-slide-up border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ley 1581</CardTitle>
              <CardDescription>
                Conozca los aspectos más importantes de la Ley 1581 de Protección de Datos Personales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                className="w-full"
                onClick={() => setShowLeyModal(true)}
              >
                Ver información
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Diagnóstico */}
          <Card className="animate-slide-up border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Realizar Diagnóstico</CardTitle>
              <CardDescription>
                Complete el cuestionario para conocer el nivel de cumplimiento de su empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate("/diagnostico")}
              >
                Iniciar Diagnóstico
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Ingresar */}
          <Card className="animate-slide-up border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ingresar</CardTitle>
              <CardDescription>
                Ingrese para consultar diagnósticos realizados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ley 1581 Modal */}
      <Dialog open={showLeyModal} onOpenChange={setShowLeyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Ley 1581 de 2012
            </DialogTitle>
            <DialogDescription>
              Protección de Datos Personales en Colombia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ¿Qué es la Ley 1581?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {informacionLey.queEs}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Objetivo
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {informacionLey.objetivo}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Principios
              </h3>
              <div className="grid gap-2">
                {informacionLey.principios.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-muted-foreground">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Derechos de los Titulares
              </h3>
              <div className="grid gap-2">
                {informacionLey.derechos.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 shrink-0" />
                    <span className="text-sm text-muted-foreground">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Obligaciones de las Empresas
              </h3>
              <div className="grid gap-2">
                {informacionLey.obligaciones.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span className="text-sm text-muted-foreground">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-white">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Diagnóstico Ley 1581. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
