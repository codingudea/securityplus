import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  getPreguntas,
  saveDiagnostico,
  getSession,
  saveRespuestasTemp,
  loadRespuestasTemp,
  clearRespuestasTemp,
} from "@/lib/db";
import {
  RESPUESTA_VALORES,
  BLOQUES,
  type RespuestaValor,
  type Respuesta,
  type Pregunta,
  type ResultadoBloque,
} from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Building,
  ClipboardCheck,
  Info,
  Calculator,
  HelpCircle,
  RotateCcw,
  BarChart3,
  Shield,
  Lock,
  FileText,
} from "lucide-react";

function Gauge({ value, size = 140, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    value >= 80 ? "text-green-500" : value >= 60 ? "text-yellow-500" : value >= 40 ? "text-orange-500" : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{value}%</span>
      </div>
    </div>
  );
}

function BlockResultCard({ resultado, icon }: { resultado: ResultadoBloque; icon: React.ReactNode }) {
  const colorClass =
    resultado.porcentaje >= 80
      ? "text-green-600 bg-green-50 border-green-200"
      : resultado.porcentaje >= 60
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : resultado.porcentaje >= 40
          ? "text-orange-600 bg-orange-50 border-orange-200"
          : "text-red-600 bg-red-50 border-red-200";

  return (
    <Card className={`border ${colorClass}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{resultado.titulo}</p>
            <p className="text-xs opacity-75">Peso: {resultado.pesoMaximo}%</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{resultado.porcentaje}%</span>
          <span className="text-xs opacity-75">Aporta: {resultado.contribucion}%</span>
        </div>
        <Progress value={resultado.porcentaje} className="h-2 mt-2" />
      </CardContent>
    </Card>
  );
}

const Diagnostico = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const preguntas = useMemo(() => getPreguntas().filter((p) => p.activa && p.bloqueId), []);

  const [currentBlock, setCurrentBlock] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [empresa, setEmpresa] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultadosBloque, setResultadosBloque] = useState<ResultadoBloque[]>([]);
  const [resultadoTotal, setResultadoTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = loadRespuestasTemp();
    if (saved.length > 0) {
      setRespuestas(saved);
    }
  }, []);

  useEffect(() => {
    if (respuestas.length > 0) {
      saveRespuestasTemp(respuestas);
    }
  }, [respuestas]);

  const bloqueActual = BLOQUES[currentBlock];

  const preguntasBloque = useMemo(() => {
    const todas = preguntas.filter((p) => p.bloqueId === bloqueActual.id);
    return todas.filter((p) => {
      if (p.tipo === "complementaria" && p.condicion) {
        const r = respuestas.find((r) => r.preguntaId === p.condicion!.preguntaId);
        return r && p.condicion!.valores.includes(r.valor);
      }
      return true;
    });
  }, [preguntas, bloqueActual, respuestas]);

  const preguntasObligatorias = useMemo(() => {
    return preguntas.filter((p) => p.tipo === "normal" || p.tipo === undefined);
  }, [preguntas]);

  const preguntasRespondidas = respuestas.length;
  const totalObligatorias = preguntasObligatorias.length;
  const porcentajeCompletado = totalObligatorias > 0 ? Math.round((preguntasRespondidas / totalObligatorias) * 100) : 0;

  const bloquesRespondidos = useMemo(() => {
    return BLOQUES.map((b) => {
      const normales = preguntas.filter((p) => p.bloqueId === b.id && (p.tipo === "normal" || p.tipo === undefined));
      const respondidas = normales.filter((p) => respuestas.some((r) => r.preguntaId === p.id));
      return {
        ...b,
        total: normales.length,
        respondidas: respondidas.length,
      };
    });
  }, [preguntas, respuestas]);

  const getNumeroPregunta = useCallback(
    (preguntaId: string): number => {
      return preguntas.findIndex((p) => p.id === preguntaId) + 1;
    },
    [preguntas]
  );

  const calcularValorPregunta = useCallback(
    (pregunta: Pregunta): number | null => {
      if (pregunta.tipo === "calculada" && pregunta.preguntasHijas) {
        const hijas = pregunta.preguntasHijas
          .map((id) => preguntas.find((p) => p.id === id))
          .filter(Boolean) as Pregunta[];
        if (hijas.length === 0) return null;
        const valores = hijas
          .map((h) => {
            const r = respuestas.find((r) => r.preguntaId === h.id);
            return r ? RESPUESTA_VALORES[r.valor] : null;
          })
          .filter((v) => v !== null) as number[];
        if (valores.length === 0) return null;
        return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
      }
      if (pregunta.tipo === "complementaria") return null;
      const respuesta = respuestas.find((r) => r.preguntaId === pregunta.id);
      if (!respuesta) return null;
      return RESPUESTA_VALORES[respuesta.valor];
    },
    [preguntas, respuestas]
  );

  const calcularBloque = useCallback(
    (bloqueId: string): ResultadoBloque => {
      const bloque = BLOQUES.find((b) => b.id === bloqueId)!;
      const normales = preguntas.filter(
        (p) => p.bloqueId === bloqueId && (p.tipo === "normal" || p.tipo === undefined)
      );

      let sumaPonderada = 0;
      let sumaPesos = 0;

      for (const p of normales) {
        const valor = calcularValorPregunta(p);
        if (valor !== null) {
          sumaPonderada += valor * p.peso;
          sumaPesos += p.peso;
        }
      }

      const porcentaje = sumaPesos > 0 ? Math.round((sumaPonderada / (sumaPesos * 100)) * 100) : 0;
      const contribucion = Math.round((porcentaje * bloque.pesoMaximo) / 100);

      return {
        bloqueId,
        titulo: bloque.titulo,
        pesoMaximo: bloque.pesoMaximo,
        porcentaje,
        contribucion,
      };
    },
    [preguntas, calcularValorPregunta]
  );

  const calcularTodosBloques = useCallback((): ResultadoBloque[] => {
    return BLOQUES.map((b) => calcularBloque(b.id));
  }, [calcularBloque]);

  useEffect(() => {
    const condicionales = preguntas.filter((p) => p.tipo === "complementaria" && p.condicion);
    for (const p of condicionales) {
      const cond = p.condicion!;
      const r = respuestas.find((r) => r.preguntaId === cond.preguntaId);
      const visible = r && cond.valores.includes(r.valor);
      if (!visible) {
        const tieneRespuesta = respuestas.some((r) => r.preguntaId === p.id);
        if (tieneRespuesta) {
          setRespuestas((prev) => prev.filter((r) => r.preguntaId !== p.id));
        }
      }
    }
  }, [respuestas, preguntas]);

  const handleRespuesta = (preguntaId: string, valor: RespuestaValor) => {
    setRespuestas((prev) => {
      const existing = prev.findIndex((r) => r.preguntaId === preguntaId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { preguntaId, valor };
        return updated;
      }
      return [...prev, { preguntaId, valor }];
    });
  };

  const getRespuestaActual = (preguntaId: string): RespuestaValor | undefined => {
    return respuestas.find((r) => r.preguntaId === preguntaId)?.valor;
  };

  const handleNext = () => {
    if (currentBlock < BLOQUES.length - 1) {
      setCurrentBlock((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentBlock > 0) {
      setCurrentBlock((s) => s - 1);
    }
  };

  const handleFinalizar = () => {
    const todasRespondidas = preguntasObligatorias.every((p) => respuestas.some((r) => r.preguntaId === p.id));
    if (!todasRespondidas) {
      const faltantes = totalObligatorias - preguntasRespondidas;
      showToast(`Faltan ${faltantes} preguntas por responder`, "error");
      return;
    }
    setShowForm(true);
  };

  const handleGuardarDiagnostico = () => {
    if (!empresa.trim()) {
      showToast("Ingresa el nombre de la empresa", "error");
      return;
    }

    setIsSubmitting(true);
    const session = getSession();
    const resultados = calcularTodosBloques();
    const total = resultados.reduce((sum, b) => sum + b.contribucion, 0);

    const diagnostico = {
      id: `d-${Date.now()}`,
      userId: session?.userId || "anon",
      empresa: empresa.trim(),
      email: "",
      ciudad: "",
      fecha: new Date().toISOString().split("T")[0],
      respuestas,
      puntaje: total,
      resultadosBloque: resultados,
    };

    saveDiagnostico(diagnostico);
    clearRespuestasTemp();
    setResultadosBloque(resultados);
    setResultadoTotal(total);
    setShowForm(false);
    setShowResult(true);
    setIsSubmitting(false);
  };

  const handleNuevoDiagnostico = () => {
    setRespuestas([]);
    setCurrentBlock(0);
    setEmpresa("");
    setShowResult(false);
    clearRespuestasTemp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lastBlock = currentBlock === BLOQUES.length - 1;

  const renderPregunta = (pregunta: Pregunta, localIndex: number) => {
    const isCalculada = pregunta.tipo === "calculada";
    const isComplementaria = pregunta.tipo === "complementaria";
    const valorCalculado = isCalculada ? calcularValorPregunta(pregunta) : null;
    const numPregunta = getNumeroPregunta(pregunta.id);

    return (
      <Card key={pregunta.id} className="border shadow-sm mb-6 overflow-hidden">
        {isCalculada && (
          <div className="h-1 bg-purple-500" />
        )}
        {isComplementaria && (
          <div className="h-1 bg-amber-500" />
        )}
        {!isCalculada && !isComplementaria && (
          <div className="h-1 bg-primary" />
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                isCalculada
                  ? "bg-purple-100 text-purple-700"
                  : isComplementaria
                    ? "bg-amber-100 text-amber-700"
                    : "bg-primary text-primary-foreground"
              }`}
            >
              {numPregunta}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CardTitle className="text-base leading-relaxed">{pregunta.texto}</CardTitle>
                {isCalculada && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">
                    <Calculator className="h-3 w-3" />
                    Calculada automáticamente
                  </span>
                )}
                {isComplementaria && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
                    <Info className="h-3 w-3" />
                    Pregunta complementaria
                  </span>
                )}
              </div>
              {pregunta.observacion && (
                <p className="text-sm text-muted-foreground mt-1">{pregunta.observacion}</p>
              )}
              {pregunta.peso > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Peso: <span className="font-medium">{pregunta.peso}%</span>
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isCalculada ? (
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-purple-500 shrink-0" />
                <div>
                  <p className="text-lg font-bold text-purple-800">
                    {valorCalculado !== null ? `${valorCalculado}%` : "—"}
                  </p>
                  <p className="text-xs text-purple-600">
                    Calculado del promedio de preguntas{" "}
                    {pregunta.preguntasHijas?.map((id) => getNumeroPregunta(id)).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <RadioGroup
              value={getRespuestaActual(pregunta.id) || ""}
              onValueChange={(value: RespuestaValor) => handleRespuesta(pregunta.id, value)}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {(
                [
                  { value: "si" as const, label: "Sí", desc: "100%", color: "border-green-500 data-[state=checked]:bg-green-50" },
                  { value: "parcialmente" as const, label: "Parcialmente", desc: "50%", color: "border-yellow-500 data-[state=checked]:bg-yellow-50" },
                  { value: "no" as const, label: "No", desc: "0%", color: "border-red-500 data-[state=checked]:bg-red-50" },
                  { value: "no_se" as const, label: "No sé", desc: "0%", color: "border-gray-400 data-[state=checked]:bg-gray-50" },
                ] as const
              ).map((opt) => {
                const isSelected = getRespuestaActual(pregunta.id) === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? `${opt.color} border-2`
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-current" : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <div className="w-3 h-3 rounded-full bg-current" />}
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </label>
                );
              })}
            </RadioGroup>
          )}
        </CardContent>
      </Card>
    );
  };

  if (showResult) {
    const getStatusLabel = (v: number) => {
      if (v >= 80) return { label: "Óptimo", color: "text-green-600" };
      if (v >= 60) return { label: "Aceptable", color: "text-yellow-600" };
      if (v >= 40) return { label: "Moderado", color: "text-orange-600" };
      return { label: "Crítico", color: "text-red-600" };
    };

    const status = getStatusLabel(resultadoTotal);

    const blockIcons = [
      <FileText className="h-5 w-5 text-blue-600" />,
      <Shield className="h-5 w-5 text-green-600" />,
      <Lock className="h-5 w-5 text-purple-600" />,
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Resultado del Diagnóstico</h1>
              <p className="text-sm text-muted-foreground">{empresa}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border shadow-lg col-span-1 lg:col-span-2">
              <CardContent className="flex flex-col items-center py-8">
                <Gauge value={resultadoTotal} size={160} strokeWidth={12} />
                <h2 className={`text-xl font-bold mt-4 ${status.color}`}>{status.label}</h2>
                <p className="text-sm text-muted-foreground mt-1">Cumplimiento total</p>
                <Progress value={resultadoTotal} className="h-3 w-full max-w-xs mt-4" />
              </CardContent>
            </Card>

            {resultadosBloque.map((res, i) => (
              <BlockResultCard key={res.bloqueId} resultado={res} icon={blockIcons[i] || <BarChart3 className="h-5 w-5" />} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              Volver al inicio
            </Button>
            <Button onClick={handleNuevoDiagnostico} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Nuevo diagnóstico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Diagnóstico de Cumplimiento</h1>
            <p className="text-sm text-muted-foreground">Ley 1581 de 2012</p>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="border shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Bloque {currentBlock + 1} de {BLOQUES.length}:</span>
                <span className="text-sm text-muted-foreground">{bloqueActual.titulo}</span>
              </div>
              <span className="text-sm font-medium text-primary">{porcentajeCompletado}%</span>
            </div>
            <Progress value={porcentajeCompletado} className="h-2.5 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {preguntasRespondidas} de {totalObligatorias} preguntas respondidas
              </span>
              <span>Peso del bloque: {bloqueActual.pesoMaximo}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Block Progress Indicators */}
        <div className="flex gap-2 mb-6">
          {BLOQUES.map((b, i) => {
            const info = bloquesRespondidos[i];
            const isActive = i === currentBlock;
            const isComplete = info.total > 0 && info.respondidas >= info.total;
            return (
              <button
                key={b.id}
                onClick={() => setCurrentBlock(i)}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : isComplete
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className={`text-xs font-semibold ${isActive ? "text-primary" : isComplete ? "text-green-700" : "text-muted-foreground"}`}>
                  Bloque {i + 1}
                </p>
                <p className={`text-[10px] mt-0.5 ${isComplete ? "text-green-600" : "text-muted-foreground"}`}>
                  {info.respondidas}/{info.total}
                </p>
              </button>
            );
          })}
        </div>

        {/* Questions for current block */}
        <div>
          {preguntasBloque.length === 0 ? (
            <Card className="border shadow-sm mb-6">
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No hay preguntas disponibles en este bloque</p>
              </CardContent>
            </Card>
          ) : (
            preguntasBloque.map((p, i) => renderPregunta(p, i))
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2 pb-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentBlock > 0) handlePrev();
              else navigate("/");
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentBlock === 0 ? "Cancelar" : "Anterior"}
          </Button>

          <div className="flex gap-3">
            {!lastBlock ? (
              <Button onClick={handleNext} className="gap-2">
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinalizar} className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Company Info Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Información de la empresa
            </DialogTitle>
            <DialogDescription>
              Ingrese el nombre de la empresa para guardar el diagnóstico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de la empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="empresa"
                  placeholder="Nombre de la empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={handleGuardarDiagnostico}
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar diagnóstico"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diagnostico;
