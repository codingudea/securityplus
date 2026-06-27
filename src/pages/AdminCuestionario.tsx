import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { getPreguntas, savePreguntas, resetPreguntas } from "@/lib/db";
import { BLOQUES, type Pregunta, type PreguntaTipo, type RespuestaValor } from "@/types";
import { Plus, Pencil, Trash2, RotateCcw, Calculator, Info, FileText, Shield, Lock, HelpCircle } from "lucide-react";

const RESPUESTA_OPTIONS: { value: RespuestaValor; label: string }[] = [
  { value: "si", label: "Sí" },
  { value: "parcialmente", label: "Parcialmente" },
  { value: "no", label: "No" },
  { value: "no_se", label: "No sé" },
];

const BLOQUE_IDS = BLOQUES.map((b) => b.id);
const BLOQUE_OPTIONS = BLOQUES.map((b) => ({ value: b.id, label: `${b.titulo} (${b.pesoMaximo}%)` }));

interface FormState {
  texto: string;
  tipo: PreguntaTipo | "";
  bloqueId: string;
  peso: number;
  activa: boolean;
  observacion: string;
  preguntasHijas: string[];
  condicionPreguntaId: string;
  condicionValores: RespuestaValor[];
}

const emptyForm = (): FormState => ({
  texto: "",
  tipo: "",
  bloqueId: "",
  peso: 0,
  activa: true,
  observacion: "",
  preguntasHijas: [],
  condicionPreguntaId: "",
  condicionValores: [],
});

const AdminCuestionario = () => {
  const { showToast } = useToast();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  useEffect(() => {
    setPreguntas(getPreguntas());
  }, []);

  const preguntasByBloque = BLOQUES.map((b) => ({
    bloque: b,
    preguntas: preguntas.filter((p) => p.bloqueId === b.id),
  }));

  const preguntasSinBloque = preguntas.filter((p) => !p.bloqueId);

  const preguntasNormales = preguntas.filter((p) => p.tipo === "normal" || !p.tipo);
  const preguntasDisponiblesHijas = preguntasNormales.filter((p) => p.bloqueId === form.bloqueId || !form.bloqueId);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const handleOpenEdit = (p: Pregunta) => {
    setEditingId(p.id);
    setForm({
      texto: p.texto,
      tipo: p.tipo || "",
      bloqueId: p.bloqueId || "",
      peso: p.peso,
      activa: p.activa,
      observacion: p.observacion || "",
      preguntasHijas: p.preguntasHijas || [],
      condicionPreguntaId: p.condicion?.preguntaId || "",
      condicionValores: p.condicion?.valores || [],
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.texto.trim()) {
      showToast("El texto de la pregunta es requerido", "error");
      return;
    }

    if (form.tipo === "calculada" && form.preguntasHijas.length === 0) {
      showToast("Una pregunta calculada debe tener al menos una pregunta hija", "error");
      return;
    }

    if (form.tipo === "complementaria" && !form.condicionPreguntaId) {
      showToast("Una pregunta complementaria debe tener una condición", "error");
      return;
    }

    const basePregunta = {
      texto: form.texto.trim(),
      peso: form.peso,
      activa: form.activa,
    };

    let updated: Pregunta[];

    if (editingId) {
      updated = preguntas.map((p) => {
        if (p.id !== editingId) return p;
        const updated: Pregunta = {
          ...p,
          ...basePregunta,
          tipo: (form.tipo || undefined) as PreguntaTipo | undefined,
          bloqueId: form.bloqueId || undefined,
          observacion: form.observacion.trim() || undefined,
        };
        if (updated.tipo === "calculada") {
          updated.preguntasHijas = form.preguntasHijas;
          updated.condicion = undefined;
        } else if (updated.tipo === "complementaria") {
          updated.condicion = {
            preguntaId: form.condicionPreguntaId,
            valores: form.condicionValores,
          };
          updated.preguntasHijas = undefined;
        } else {
          updated.preguntasHijas = undefined;
          updated.condicion = undefined;
        }
        return updated;
      });
      showToast("Pregunta actualizada", "success");
    } else {
      const newP: Pregunta = {
        id: `p-${Date.now()}`,
        ...basePregunta,
      };
      if (form.tipo) {
        newP.tipo = form.tipo as PreguntaTipo;
        newP.bloqueId = form.bloqueId || undefined;
        newP.observacion = form.observacion.trim() || undefined;
      }
      if (newP.tipo === "calculada") {
        newP.preguntasHijas = form.preguntasHijas;
      } else if (newP.tipo === "complementaria") {
        newP.condicion = {
          preguntaId: form.condicionPreguntaId,
          valores: form.condicionValores,
        };
      }
      updated = [...preguntas, newP];
      showToast("Pregunta creada", "success");
    }

    setPreguntas(updated);
    savePreguntas(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = preguntas.filter((p) => p.id !== id);
    setPreguntas(updated);
    savePreguntas(updated);
    showToast("Pregunta eliminada", "success");
  };

  const handleReset = () => {
    resetPreguntas();
    setPreguntas(getPreguntas());
    showToast("Preguntas restablecidas a valores por defecto", "success");
  };

  const getTipoBadge = (tipo?: string) => {
    switch (tipo) {
      case "calculada":
        return <Badge variant="warning" className="gap-1"><Calculator className="h-3 w-3" />Calculada</Badge>;
      case "complementaria":
        return <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" />Complementaria</Badge>;
      default:
        return <Badge variant="default" className="gap-1">Normal</Badge>;
    }
  };

  const getBloqueLabel = (bloqueId?: string) => {
    if (!bloqueId) return "—";
    const b = BLOQUES.find((b) => b.id === bloqueId);
    return b ? b.titulo : bloqueId;
  };

  const toggleHija = (id: string) => {
    setForm((prev) => ({
      ...prev,
      preguntasHijas: prev.preguntasHijas.includes(id)
        ? prev.preguntasHijas.filter((h) => h !== id)
        : [...prev.preguntasHijas, id],
    }));
  };

  const toggleCondicionValor = (v: RespuestaValor) => {
    setForm((prev) => ({
      ...prev,
      condicionValores: prev.condicionValores.includes(v)
        ? prev.condicionValores.filter((x) => x !== v)
        : [...prev.condicionValores, v],
    }));
  };

  const blockIcons = [
    <FileText className="h-4 w-4" />,
    <Shield className="h-4 w-4" />,
    <Lock className="h-4 w-4" />,
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestión de Preguntas</h1>
          <p className="text-muted-foreground mt-1">
            Administre las preguntas del cuestionario de diagnóstico
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Button>
          <Button onClick={handleOpenNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Pregunta
          </Button>
        </div>
      </div>

      {preguntas.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay preguntas registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {preguntasByBloque.map(({ bloque, preguntas: pq }, bi) => (
            <Card key={bloque.id} className="border-0 shadow-lg overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {blockIcons[bi] || <HelpCircle className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-primary">{bloque.titulo}</h2>
                  <p className="text-xs text-muted-foreground">Peso máximo: {bloque.pesoMaximo}% — {pq.length} preguntas</p>
                </div>
              </div>
              <CardContent className="p-0">
                {pq.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay preguntas en este bloque
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Pregunta</TableHead>
                        <TableHead className="w-28">Tipo</TableHead>
                        <TableHead className="w-16 text-center">Peso</TableHead>
                        <TableHead className="w-20 text-center">Estado</TableHead>
                        <TableHead className="w-28 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pq.map((p, i) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {preguntas.findIndex((q) => q.id === p.id) + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium text-sm">{p.texto}</span>
                              {p.observacion && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{p.observacion}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getTipoBadge(p.tipo)}</TableCell>
                          <TableCell className="text-center font-mono text-sm">{p.peso}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={p.activa ? "success" : "secondary"}>
                              {p.activa ? "Activa" : "Inactiva"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
          ))}

          {preguntasSinBloque.length > 0 && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h2 className="text-lg font-semibold text-muted-foreground">Sin bloque</h2>
                  <p className="text-xs text-muted-foreground">{preguntasSinBloque.length} preguntas</p>
                </div>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Pregunta</TableHead>
                      <TableHead className="w-28">Tipo</TableHead>
                      <TableHead className="w-16 text-center">Peso</TableHead>
                      <TableHead className="w-20 text-center">Estado</TableHead>
                      <TableHead className="w-28 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preguntasSinBloque.map((p, i) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground font-mono text-xs">{i + 1}</TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">{p.texto}</span>
                        </TableCell>
                        <TableCell>{getTipoBadge(p.tipo)}</TableCell>
                        <TableCell className="text-center font-mono text-sm">{p.peso}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.activa ? "success" : "secondary"}>
                            {p.activa ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modifique los campos de la pregunta" : "Complete los campos para crear una nueva pregunta"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Texto */}
            <div className="space-y-2">
              <Label htmlFor="texto">Texto de la pregunta</Label>
              <Input
                id="texto"
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                placeholder="Escriba la pregunta..."
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as PreguntaTipo | "" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Normal</option>
                <option value="calculada">Calculada</option>
                <option value="complementaria">Complementaria</option>
              </select>
            </div>

            {/* Bloque */}
            <div className="space-y-2">
              <Label htmlFor="bloqueId">Bloque</Label>
              <select
                id="bloqueId"
                value={form.bloqueId}
                onChange={(e) => setForm({ ...form, bloqueId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sin bloque</option>
                {BLOQUE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Peso */}
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (%)</Label>
              <Input
                id="peso"
                type="number"
                min={0}
                max={100}
                value={form.peso}
                onChange={(e) => setForm({ ...form, peso: Number(e.target.value) })}
              />
            </div>

            {/* Observación */}
            <div className="space-y-2">
              <Label htmlFor="observacion">Observación</Label>
              <textarea
                id="observacion"
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                placeholder="Observación opcional..."
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Preguntas hijas (solo para calculada) */}
            {form.tipo === "calculada" && (
              <div className="space-y-2 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Label className="text-purple-800 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Preguntas hijas (promedio)
                </Label>
                <p className="text-xs text-purple-600 mb-2">
                  Seleccione las preguntas cuyo promedio se usará para calcular esta pregunta.
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {preguntasDisponiblesHijas.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No hay preguntas normales disponibles</p>
                  ) : (
                    preguntasDisponiblesHijas.map((h) => (
                      <label key={h.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 rounded hover:bg-purple-100/50">
                        <input
                          type="checkbox"
                          checked={form.preguntasHijas.includes(h.id)}
                          onChange={() => toggleHija(h.id)}
                          className="rounded"
                        />
                        <span className="truncate">{h.texto}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Condición (solo para complementaria) */}
            {form.tipo === "complementaria" && (
              <div className="space-y-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <Label className="text-amber-800 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Condición de visibilidad
                </Label>
                <p className="text-xs text-amber-600 mb-2">
                  Esta pregunta solo se muestra si la pregunta padre tiene cierta respuesta.
                </p>

                <div className="space-y-2">
                  <Label className="text-xs">Pregunta padre</Label>
                  <select
                    value={form.condicionPreguntaId}
                    onChange={(e) => setForm({ ...form, condicionPreguntaId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Seleccionar pregunta...</option>
                    {preguntasNormales.map((p) => (
                      <option key={p.id} value={p.id}>{p.texto}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Mostrar cuando la respuesta sea</Label>
                  <div className="flex flex-wrap gap-2">
                    {RESPUESTA_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          form.condicionValores.includes(opt.value)
                            ? "bg-amber-200 border-amber-400 font-medium"
                            : "bg-white border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.condicionValores.includes(opt.value)}
                          onChange={() => toggleCondicionValor(opt.value)}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activa */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activa"
                checked={form.activa}
                onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="activa">Pregunta activa</Label>
            </div>

            <Button onClick={handleSave} className="w-full">
              {editingId ? "Guardar cambios" : "Crear pregunta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCuestionario;
