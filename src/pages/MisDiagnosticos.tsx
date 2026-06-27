import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getDiagnosticosByUser, getSession } from "@/lib/db";
import type { Diagnostico, Pregunta } from "@/types";
import { getPreguntas } from "@/lib/db";
import { FileText, Download, Eye, ClipboardCheck, Building, Mail, MapPin, Calendar, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

const MisDiagnosticos = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [selectedDiag, setSelectedDiag] = useState<Diagnostico | null>(null);
  const [showResult, setShowResult] = useState(false);
  const session = getSession();

  useEffect(() => {
    if (session) {
      setDiagnosticos(getDiagnosticosByUser(session.userId));
      setPreguntas(getPreguntas());
    }
  }, [session]);

  const getBadgeVariant = (puntaje: number) => {
    if (puntaje >= 80) return "success";
    if (puntaje >= 60) return "warning";
    return "danger";
  };

  const getStatusText = (puntaje: number) => {
    if (puntaje >= 80) return "Óptimo";
    if (puntaje >= 60) return "Aceptable";
    if (puntaje >= 40) return "Moderado";
    return "Crítico";
  };

  const getRespuestaIcon = (valor: string) => {
    switch (valor) {
      case "si": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "parcialmente": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "no": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRespuestaLabel = (valor: string) => {
    switch (valor) {
      case "si": return "Sí";
      case "parcialmente": return "Parcialmente";
      case "no": return "No";
      default: return "No sé";
    }
  };

  const handleDownload = (diag: Diagnostico) => {
    window.print();
  };

  const handlePrint = () => {
    const printContent = document.getElementById("resultado-print");
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleViewResult = (diag: Diagnostico) => {
    setSelectedDiag(diag);
    setShowResult(true);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Mis Diagnósticos</h1>
            <p className="text-muted-foreground mt-1">
              Consulte los diagnósticos de cumplimiento realizados
            </p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Historial de Diagnósticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticos.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardCheck className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No tiene diagnósticos realizados</p>
              <p className="text-sm mb-6">Realice un diagnóstico para ver los resultados aquí</p>
              <Button onClick={() => window.location.href = "/diagnostico"}>
                Realizar Diagnóstico
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosticos.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.fecha}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={d.puntaje} className="w-24 h-2" />
                        <span className="text-sm font-medium">{d.puntaje}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(d.puntaje)}>
                        {getStatusText(d.puntaje)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResult(d)}
                          className="gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver resultado
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(d)}
                          className="gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Result Detail Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Detalle del Diagnóstico
            </DialogTitle>
          </DialogHeader>

          {selectedDiag && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDiag.empresa}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDiag.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDiag.ciudad}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDiag.fecha}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {selectedDiag.puntaje}%
                  </span>
                </div>
                <Badge variant={getBadgeVariant(selectedDiag.puntaje)} className="text-sm px-4 py-1">
                  {getStatusText(selectedDiag.puntaje)}
                </Badge>
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Respuestas</h3>
                {selectedDiag.respuestas.map((r) => {
                  const pregunta = preguntas.find((p) => p.id === r.preguntaId);
                  return (
                    <div
                      key={r.preguntaId}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      {getRespuestaIcon(r.valor)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{pregunta?.texto || "Pregunta no encontrada"}</p>
                        <span className="text-xs text-muted-foreground">
                          {getRespuestaLabel(r.valor)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Print Button */}
              <div className="flex justify-center">
                <Button onClick={handlePrint} className="gap-2">
                  <Download className="h-4 w-4" />
                  Imprimir / Descargar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MisDiagnosticos;
