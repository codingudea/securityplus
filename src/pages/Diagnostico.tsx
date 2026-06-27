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
  getDiagnosticos,
} from "@/lib/db";
import {
  RESPUESTA_VALORES,
  BLOQUES,
  type RespuestaValor,
  type Respuesta,
  type Pregunta,
  type ResultadoBloque,
  type AnalisisIA,
  type Accion,
} from "@/types";
import { analizarDiagnostico, MODEL, type DatosAnalisis } from "@/lib/chat";
import ChatWidget from "@/components/chat/ChatWidget";
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
  BarChart,
  ListChecks,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Download,
  MessageCircle,
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
  const [showWelcomeChat, setShowWelcomeChat] = useState(() => {
    return !sessionStorage.getItem("diag_welcome_shown");
  });
  const [analizando, setAnalizando] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<AnalisisIA | null>(null);
  const [errorAnalisis, setErrorAnalisis] = useState<string | null>(null);
  const [diagnosticoGuardado, setDiagnosticoGuardado] = useState<any>(null);

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

  const ejecutarAnalisisIA = useCallback(
    async (diag: any, resultadosBloque: ResultadoBloque[], respuestasActuales: Respuesta[]) => {
      setAnalizando(true);
      setErrorAnalisis(null);

      const datosAnalisis: DatosAnalisis = {
        empresa: diag.empresa,
        fecha: diag.fecha,
        resultadoTotal: diag.puntaje,
        resultadosBloque: resultadosBloque.map((r) => ({
          titulo: r.titulo,
          porcentaje: r.porcentaje,
          pesoMaximo: r.pesoMaximo,
        })),
        respuestas: respuestasActuales.map((r) => {
          const p = preguntas.find((q) => q.id === r.preguntaId);
          return {
            numero: (preguntas.findIndex((q) => q.id === r.preguntaId) + 1),
            texto: p?.texto || "",
            peso: p?.peso || 0,
            valor: r.valor,
            valorNumerico: RESPUESTA_VALORES[r.valor],
          };
        }),
      };

      const result = await analizarDiagnostico(datosAnalisis);

      if (result.success && result.content) {
        try {
          const parsed: AnalisisIA = JSON.parse(result.content);
          if (parsed.interpretacion && parsed.planDeAccion) {
            parsed.fechaGeneracion = new Date().toISOString();
            parsed.modelo = MODEL;
            setAnalisisIA(parsed);

            const updatedDiag = { ...diag, analisisIA: parsed };
            const allDiagnosticos = getDiagnosticos().map((d) =>
              d.id === diag.id ? updatedDiag : d
            );
            localStorage.setItem("ley1581_diagnosticos", JSON.stringify(allDiagnosticos));

            setDiagnosticoGuardado(updatedDiag);
          } else {
            setErrorAnalisis("La respuesta de la IA no tiene el formato esperado.");
          }
        } catch {
          setErrorAnalisis("No se pudo interpretar la respuesta de la IA.");
        }
      } else {
        setErrorAnalisis(result.error || "Error al conectar con la IA.");
      }

      setAnalizando(false);
    },
    [preguntas]
  );

  const handleGuardarDiagnostico = () => {
    if (!empresa.trim()) {
      showToast("Ingresa el nombre de la empresa", "error");
      return;
    }

    setIsSubmitting(true);
    const session = getSession();
    const resultados = calcularTodosBloques();
    const total = resultados.reduce((sum, b) => sum + b.contribucion, 0);

    const diag = {
      id: `d-${Date.now()}`,
      userId: session?.userId || "anon",
      empresa: empresa.trim(),
      email: "",
      ciudad: "",
      fecha: new Date().toISOString().split("T")[0],
      respuestas: [...respuestas],
      puntaje: total,
      resultadosBloque: resultados,
    };

    saveDiagnostico(diag);
    clearRespuestasTemp();
    setResultadosBloque(resultados);
    setResultadoTotal(total);
    setDiagnosticoGuardado(diag);
    setShowForm(false);
    setIsSubmitting(false);

    ejecutarAnalisisIA(diag, resultados, respuestas);
    setShowResult(true);
  };

  const handleDownload = () => {
    const total = resultadoTotal;
    const status = total >= 80 ? "Óptimo" : total >= 60 ? "Aceptable" : total >= 40 ? "Moderado" : "Crítico";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const respuestaLabel: Record<string, string> = {
      si: "Sí",
      parcialmente: "Parcialmente",
      no: "No",
      no_se: "No sé",
    };

    const allPreguntas = preguntas;
    const respuestasConTexto = respuestas
      .map((r) => {
        const p = allPreguntas.find((q) => q.id === r.preguntaId);
        const num = allPreguntas.findIndex((q) => q.id === r.preguntaId) + 1;
        return p ? { num, texto: p.texto, peso: p.peso, valor: respuestaLabel[r.valor] || r.valor } : null;
      })
      .filter(Boolean);

    const accionesHtml = analisisIA?.planDeAccion?.length
      ? analisisIA.planDeAccion
          .map(
            (a) => `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold">${a.accion}</td>
            <td style="padding:8px;border:1px solid #ddd">${a.objetivo}</td>
            <td style="padding:8px;border:1px solid #ddd">${a.beneficio}</td>
            <td style="padding:8px;border:1px solid #ddd">${a.area}</td>
            <td style="padding:8px;border:1px solid #ddd;text-transform:capitalize">${a.prioridad}</td>
          </tr>`
          )
          .join("")
      : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Diagnóstico Ley 1581 - ${empresa}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 40px; line-height: 1.6; }
        h1 { color: #1a237e; font-size: 24px; border-bottom: 2px solid #1a237e; padding-bottom: 8px; }
        h2 { color: #283593; font-size: 18px; margin-top: 24px; }
        h3 { color: #3949ab; font-size: 15px; margin-top: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { border: none; margin-bottom: 4px; }
        .header p { color: #666; font-size: 14px; }
        .score-box { text-align: center; padding: 20px; background: #e8eaf6; border-radius: 8px; margin: 20px 0; }
        .score-box .total { font-size: 48px; font-weight: bold; color: #1a237e; }
        .score-box .label { font-size: 14px; color: #666; }
        .block-grid { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
        .block-card { flex: 1; min-width: 180px; padding: 16px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
        .block-card .name { font-weight: bold; font-size: 13px; margin-bottom: 4px; }
        .block-card .pct { font-size: 24px; font-weight: bold; color: #1a237e; }
        .block-card .weight { font-size: 11px; color: #999; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
        th { background: #e8eaf6; padding: 10px 8px; text-align: left; border: 1px solid #c5cae9; font-weight: 600; }
        td { padding: 8px; border: 1px solid #ddd; }
        .interpretation { padding: 16px; background: #f5f5f5; border-radius: 8px; white-space: pre-line; font-size: 13px; line-height: 1.7; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style>
      </head><body>
        <div class="header">
          <h1>Diagnóstico de Cumplimiento - Ley 1581 de 2012</h1>
          <p><strong>Empresa:</strong> ${empresa} | <strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO")}</p>
        </div>

        <div class="score-box">
          <div class="total">${total}%</div>
          <div class="label">${status}</div>
        </div>

        <h2>Resultados por bloque</h2>
        <div class="block-grid">
          ${resultadosBloque
            .map(
              (b) => `
            <div class="block-card">
              <div class="name">${b.titulo}</div>
              <div class="pct">${b.porcentaje}%</div>
              <div class="weight">Peso: ${b.pesoMaximo}% | Aporta: ${b.contribucion}%</div>
            </div>`
            )
            .join("")}
        </div>

        <h2>Respuestas del cuestionario</h2>
        <table>
          <thead><tr><th>#</th><th>Pregunta</th><th>Peso</th><th>Respuesta</th></tr></thead>
          <tbody>
            ${respuestasConTexto
              .map(
                (r) =>
                  `<tr><td>${r!.num}</td><td>${r!.texto}</td><td>${r!.peso}%</td><td>${r!.valor}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>

        ${
          analisisIA?.interpretacion
            ? `
          <h2>Interpretación del nivel de cumplimiento</h2>
          <div class="interpretation">${analisisIA.interpretacion}</div>`
            : ""
        }

        ${
          accionesHtml
            ? `
          <h2>Plan de acción recomendado</h2>
          <table>
            <thead><tr><th>Acción</th><th>Objetivo</th><th>Beneficio</th><th>Área</th><th>Prioridad</th></tr></thead>
            <tbody>${accionesHtml}</tbody>
          </table>`
            : ""
        }

        <div class="footer">
          Documento generado el ${new Date().toLocaleString("es-CO")} a través del Sistema de Diagnóstico Ley 1581.
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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

    const prioridadColor = (p: string) => {
      switch (p) {
        case "alta": return { border: "border-red-300", bg: "bg-red-50", badge: "bg-red-100 text-red-700" };
        case "media": return { border: "border-yellow-300", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700" };
        default: return { border: "border-green-300", bg: "bg-green-50", badge: "bg-green-100 text-green-700" };
      }
    };

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

          {/* Scores */}
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

          {/* AI Analysis Loading */}
          {analizando && (
            <Card className="border shadow-lg mb-8">
              <CardContent className="flex flex-col items-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-primary">Analizando los resultados del diagnóstico...</p>
                <p className="text-sm text-muted-foreground mt-1">Generando interpretación y plan de acción personalizado</p>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Error with Retry */}
          {!analizando && errorAnalisis && (
            <Card className="border border-red-200 shadow-sm mb-8 bg-red-50">
              <CardContent className="flex flex-col items-center py-8">
                <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
                <p className="text-sm text-red-700 text-center mb-4">{errorAnalisis}</p>
                <p className="text-xs text-red-500 mb-4">
                  No fue posible generar la interpretación automática en este momento. El diagnóstico numérico se ha guardado correctamente.
                </p>
                <Button
                  variant="outline"
                  onClick={() => diagnosticoGuardado && ejecutarAnalisisIA(diagnosticoGuardado, resultadosBloque, respuestas)}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar análisis
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Interpretation */}
          {!analizando && analisisIA && (
            <Card className="border shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Interpretación del nivel de cumplimiento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {analisisIA.interpretacion}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          {!analizando && analisisIA && analisisIA.planDeAccion.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ListChecks className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-primary">Plan de acción recomendado</h2>
              </div>

              {(["alta", "media", "baja"] as const).map((prioridad) => {
                const acciones = analisisIA.planDeAccion.filter((a) => a.prioridad === prioridad);
                if (acciones.length === 0) return null;
                const labelMap = { alta: "Alta prioridad", media: "Prioridad media", baja: "Baja prioridad" };
                const colorMap = {
                  alta: { text: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
                  media: { text: "text-yellow-700", bg: "bg-yellow-50", dot: "bg-yellow-500" },
                  baja: { text: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
                };
                const c = colorMap[prioridad];

                return (
                  <div key={prioridad} className="mb-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${c.bg} ${c.text} mb-3`}>
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {labelMap[prioridad]}
                    </div>
                    <div className="space-y-3">
                      {acciones.map((acc, i) => {
                        const pc = prioridadColor(acc.prioridad);
                        return (
                          <Card key={i} className={`border ${pc.border} ${pc.bg}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-sm">{acc.accion}</h3>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pc.badge}`}>
                                  {acc.prioridad === "alta" ? "Crítica" : acc.prioridad === "media" ? "Importante" : "Buenas prácticas"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{acc.objetivo}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Beneficio: {acc.beneficio}</span>
                                <span>Área: {acc.area}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              Volver al inicio
            </Button>
            <Button onClick={handleNuevoDiagnostico} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Nuevo diagnóstico
            </Button>
            {!analizando && analisisIA && (
              <Button onClick={handleDownload} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Descargar diagnóstico
              </Button>
            )}
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

      {/* Welcome Chat Modal */}
      <Dialog open={showWelcomeChat} onOpenChange={(v) => {
        setShowWelcomeChat(v);
        if (!v) sessionStorage.setItem("diag_welcome_shown", "1");
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              ¿Necesitas ayuda?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si tienes dudas sobre alguna pregunta del cuestionario, puedes usar el chat de ayuda
              haciendo clic en el botón{" "}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                <MessageCircle className="h-3 w-3" />
                Asistente
              </span>{" "}
              en la esquina inferior derecha de la pantalla.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El asistente te explicará cada pregunta en lenguaje sencillo, te dará ejemplos prácticos
              y te orientará sobre cómo responder.
            </p>
            <Button onClick={() => {
              setShowWelcomeChat(false);
              sessionStorage.setItem("diag_welcome_shown", "1");
            }} className="w-full">
              ¡Entendido, comencemos!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Diagnostico;
