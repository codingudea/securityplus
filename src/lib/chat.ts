const API_URL = "https://api.openai.com/v1/responses";
export const MODEL = "gpt-5.4-mini";

interface ChatResponse {
  success: boolean;
  content?: string;
  error?: string;
}

import systemPromptRaw from "@/../skills/prompt_chat.txt?raw";
const SYSTEM_PROMPT = systemPromptRaw;

function getApiKey(): string {
  const fromEnv = import.meta.env.VITE_OPENAI_API_KEY;
  if (fromEnv) return fromEnv;
  const fromWindow = (window as any).__OPENAI_API_KEY;
  if (fromWindow) return fromWindow;
  return "";
}

async function callAPI(input: { role: string; content: string }[]): Promise<ChatResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { success: false, error: "API key no configurada. Agrega VITE_OPENAI_API_KEY en el archivo .env" };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: MODEL, input }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      const errCode = err?.error?.code || err?.code || "";
      const errMsg = err?.error?.message || err?.error || (typeof err === "string" ? err : await response.text());
      if (errCode === "permission-denied" || errCode === "insufficient_quota") {
        return { success: false, error: "La cuenta de OpenAI no tiene créditos disponibles o ha excedido la cuota." };
      }
      return { success: false, error: `Error de API (${response.status}): ${errMsg}` };
    }

    const data = await response.json();
    const outputText = data?.output?.[0]?.content?.[0]?.text || data?.output?.[0]?.content?.text;
    if (!outputText) return { success: false, error: "Respuesta vacía del asistente" };
    return { success: true, content: outputText };
  } catch (err) {
    return { success: false, error: `Error de conexión: ${err instanceof Error ? err.message : "desconocido"}` };
  }
}

export async function sendMessage(userMessage: string): Promise<ChatResponse> {
  return callAPI([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ]);
}

export interface DatosAnalisis {
  empresa: string;
  fecha: string;
  resultadoTotal: number;
  resultadosBloque: { titulo: string; porcentaje: number; pesoMaximo: number }[];
  respuestas: { numero: number; texto: string; peso: number; valor: string; valorNumerico: number }[];
}

const ANALISIS_SYSTEM_PROMPT = `Eres un analista especializado en protección de datos personales y cumplimiento normativo colombiano (Ley 1581 de 2012).

Tu función es analizar los resultados de un diagnóstico de cumplimiento y generar:

1. Una interpretación clara del nivel de cumplimiento.
2. Un plan de acción priorizado.

Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional.

## Formato de respuesta

{
  "interpretacion": "texto con 3 a 5 párrafos explicando el resultado...",
  "planDeAccion": [
    {
      "accion": "Nombre de la acción",
      "objetivo": "Descripción detallada de lo que se debe hacer",
      "beneficio": "Beneficio esperado al implementar esta acción",
      "area": "Área responsable sugerida",
      "prioridad": "alta"
    }
  ]
}

## Reglas para la interpretación

- Explicar qué significa el porcentaje obtenido en lenguaje sencillo.
- Señalar fortalezas y riesgos principales.
- No usar lenguaje alarmista.
- No afirmar que la empresa incumple la ley.
- Hablar del nivel de madurez observado.
- 3 a 5 párrafos.

## Reglas para el plan de acción

- Basarse únicamente en las respuestas del diagnóstico.
- Las acciones deben corresponder a preguntas respondidas como "No", "Parcialmente" o "No sé".
- No generar acciones para aspectos que ya se cumplen.
- Priorizar: alta (crítico), media (importante), baja (buena práctica).
- No repetir acciones.
- Usar áreas genéricas: Dirección, Jurídica, Tecnología, Recursos Humanos, Seguridad de la Información, Cumplimiento.
- Cada acción debe incluir: accion, objetivo, beneficio, area, prioridad.`;

export async function analizarDiagnostico(datos: DatosAnalisis): Promise<ChatResponse> {
  const preguntasIncumplidas = datos.respuestas
    .filter((r) => r.valor === "no")
    .map((r) => ({ numero: r.numero, texto: r.texto }));
  const preguntasParciales = datos.respuestas
    .filter((r) => r.valor === "parcialmente")
    .map((r) => ({ numero: r.numero, texto: r.texto }));
  const preguntasNoSe = datos.respuestas
    .filter((r) => r.valor === "no_se")
    .map((r) => ({ numero: r.numero, texto: r.texto }));

  const contexto = [
    "## Datos del diagnóstico",
    `Empresa: ${datos.empresa}`,
    `Fecha: ${datos.fecha}`,
    `Resultado total: ${datos.resultadoTotal}%`,
    "",
    "## Resultados por bloque",
    ...datos.resultadosBloque.map((b) => `- ${b.titulo}: ${b.porcentaje}% (peso: ${b.pesoMaximo}%)`),
    "",
    "## Respuestas del cuestionario",
    ...datos.respuestas.map(
      (r) => `- Pregunta ${r.numero} (${r.peso}%): "${r.texto}" → ${r.valor} (${r.valorNumerico}%)`
    ),
    "",
    ...(preguntasIncumplidas.length > 0
      ? ["## Preguntas incumplidas (No)", ...preguntasIncumplidas.map((r) => `- Pregunta ${r.numero}: ${r.texto}`)]
      : []),
    ...(preguntasParciales.length > 0
      ? ["## Preguntas parcialmente cumplidas", ...preguntasParciales.map((r) => `- Pregunta ${r.numero}: ${r.texto}`)]
      : []),
    ...(preguntasNoSe.length > 0
      ? ["## Preguntas sin respuesta clara (No sé)", ...preguntasNoSe.map((r) => `- Pregunta ${r.numero}: ${r.texto}`)]
      : []),
    "",
    "Genera la interpretación y el plan de acción en formato JSON.",
  ].join("\n");

  return callAPI([
    { role: "system", content: ANALISIS_SYSTEM_PROMPT },
    { role: "user", content: contexto },
  ]);
}
