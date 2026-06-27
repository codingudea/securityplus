import type { User, Pregunta, Diagnostico, Respuesta } from "@/types";
import { USUARIOS_DEFAULT, PREGUNTAS_DEFAULT } from "@/types";

const KEYS = {
  USERS: "ley1581_usuarios",
  PREGUNTAS: "ley1581_preguntas",
  DIAGNOSTICOS: "ley1581_diagnosticos",
  SESSION: "ley1581_session",
} as const;

function initStorage<T>(key: string, defaultData: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
}

export function getUsers(): User[] {
  return initStorage<User[]>(KEYS.USERS, USUARIOS_DEFAULT);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function getPreguntas(): Pregunta[] {
  return initStorage<Pregunta[]>(KEYS.PREGUNTAS, PREGUNTAS_DEFAULT);
}

export function savePreguntas(preguntas: Pregunta[]): void {
  localStorage.setItem(KEYS.PREGUNTAS, JSON.stringify(preguntas));
}

export function getDiagnosticos(): Diagnostico[] {
  return initStorage<Diagnostico[]>(KEYS.DIAGNOSTICOS, []);
}

export function saveDiagnostico(diagnostico: Diagnostico): void {
  const diagnosticos = getDiagnosticos();
  diagnosticos.push(diagnostico);
  localStorage.setItem(KEYS.DIAGNOSTICOS, JSON.stringify(diagnosticos));
}

export function getDiagnosticosByUser(userId: string): Diagnostico[] {
  return getDiagnosticos().filter((d) => d.userId === userId);
}

export function getSession(): { userId: string; role: string } | null {
  const stored = localStorage.getItem(KEYS.SESSION);
  return stored ? JSON.parse(stored) : null;
}

export function setSession(userId: string, role: string): void {
  localStorage.setItem(KEYS.SESSION, JSON.stringify({ userId, role }));
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.SESSION);
}

export function resetPreguntas(): void {
  localStorage.setItem(KEYS.PREGUNTAS, JSON.stringify(PREGUNTAS_DEFAULT));
}

const TEMP_RESPUESTAS_KEY = "ley1581_temp_respuestas";

export function saveRespuestasTemp(respuestas: Respuesta[]): void {
  localStorage.setItem(TEMP_RESPUESTAS_KEY, JSON.stringify(respuestas));
}

export function loadRespuestasTemp(): Respuesta[] {
  const stored = localStorage.getItem(TEMP_RESPUESTAS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function clearRespuestasTemp(): void {
  localStorage.removeItem(TEMP_RESPUESTAS_KEY);
}
