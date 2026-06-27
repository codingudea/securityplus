const API_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-5.4-mini";

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

export async function sendMessage(userMessage: string): Promise<ChatResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: "API key no configurada. Agrega VITE_OPENAI_API_KEY en el archivo .env",
    };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      const errCode = err?.error?.code || err?.code || "";
      const errMsg = err?.error?.message || err?.error || (typeof err === "string" ? err : await response.text());

      if (errCode === "permission-denied" || errCode === "insufficient_quota") {
        return {
          success: false,
          error: "La cuenta de OpenAI no tiene créditos disponibles o ha excedido la cuota.",
        };
      }

      return {
        success: false,
        error: `Error de API (${response.status}): ${errMsg}`,
      };
    }

    const data = await response.json();

    const outputText = data?.output?.[0]?.content?.[0]?.text || data?.output?.[0]?.content?.text;

    if (!outputText) {
      return {
        success: false,
        error: "Respuesta vacía del asistente",
      };
    }

    return { success: true, content: outputText };
  } catch (err) {
    return {
      success: false,
      error: `Error de conexión: ${err instanceof Error ? err.message : "desconocido"}`,
    };
  }
}
