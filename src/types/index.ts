export type UserRole = "admin" | "empresa";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  nombre: string;
}

export type RespuestaValor = "si" | "parcialmente" | "no" | "no_se";

export type PreguntaTipo = "normal" | "calculada" | "complementaria";

export interface Pregunta {
  id: string;
  texto: string;
  peso: number;
  activa: boolean;
  tipo?: PreguntaTipo;
  bloqueId?: string;
  observacion?: string;
  preguntasHijas?: string[];
  condicion?: {
    preguntaId: string;
    valores: RespuestaValor[];
  };
}

export interface Respuesta {
  preguntaId: string;
  valor: RespuestaValor;
}

export interface BloqueInfo {
  id: string;
  titulo: string;
  pesoMaximo: number;
}

export interface ResultadoBloque {
  bloqueId: string;
  titulo: string;
  pesoMaximo: number;
  porcentaje: number;
  contribucion: number;
}

export interface Diagnostico {
  id: string;
  userId: string;
  empresa: string;
  email?: string;
  ciudad?: string;
  fecha: string;
  respuestas: Respuesta[];
  puntaje: number;
  resultadosBloque?: ResultadoBloque[];
}

export const RESPUESTA_VALORES: Record<RespuestaValor, number> = {
  si: 100,
  parcialmente: 50,
  no: 0,
  no_se: 0,
};

export const BLOQUES: BloqueInfo[] = [
  { id: "b1", titulo: "Política de datos personales", pesoMaximo: 40 },
  { id: "b2", titulo: "Privacidad desde el diseño", pesoMaximo: 36 },
  { id: "b3", titulo: "Gobernanza", pesoMaximo: 24 },
];

export const PREGUNTAS_DEFAULT: Pregunta[] = [
  // Bloque 1 - Política de datos personales (40%)
  {
    id: "p1",
    texto: "¿Cuenta con una política de tratamiento de datos personales?",
    peso: 0,
    activa: true,
    tipo: "calculada",
    bloqueId: "b1",
    observacion: "Este resultado se calcula automáticamente con base en las preguntas 2 a 5.",
    preguntasHijas: ["p2", "p3", "p4", "p5"],
  },
  {
    id: "p2",
    texto: "¿La política está documentada y publicada en medio de fácil acceso?",
    peso: 10,
    activa: true,
    tipo: "normal",
    bloqueId: "b1",
  },
  {
    id: "p3",
    texto: "¿Define las finalidades del tratamiento de datos?",
    peso: 10,
    activa: true,
    tipo: "normal",
    bloqueId: "b1",
  },
  {
    id: "p4",
    texto: "¿Incluye los derechos de los titulares?",
    peso: 10,
    activa: true,
    tipo: "normal",
    bloqueId: "b1",
  },
  {
    id: "p5",
    texto: "¿Menciona cómo ejercer los derechos de los titulares?",
    peso: 10,
    activa: true,
    tipo: "normal",
    bloqueId: "b1",
  },
  // Bloque 2 - Privacidad desde el diseño (36%)
  {
    id: "p6",
    texto: "¿Incorpora evaluaciones de impacto (Privacy Impact Assessments)?",
    peso: 12,
    activa: true,
    tipo: "normal",
    bloqueId: "b2",
  },
  {
    id: "p7",
    texto: "¿Aplica técnicas de minimización de datos?",
    peso: 12,
    activa: true,
    tipo: "normal",
    bloqueId: "b2",
  },
  {
    id: "p8",
    texto: "¿Configura sus sistemas para recopilar el mínimo de datos por defecto?",
    peso: 12,
    activa: true,
    tipo: "normal",
    bloqueId: "b2",
  },
  // Bloque 3 - Gobernanza (24%)
  {
    id: "p9",
    texto: "¿Cuenta con un sistema de administración de riesgos?",
    peso: 16,
    activa: true,
    tipo: "normal",
    bloqueId: "b3",
  },
  {
    id: "p10",
    texto: "¿Cuenta con un oficial de protección de datos personales?",
    peso: 8,
    activa: true,
    tipo: "normal",
    bloqueId: "b3",
  },
  {
    id: "p11",
    texto: "¿Está designado formalmente?",
    peso: 0,
    activa: true,
    tipo: "complementaria",
    bloqueId: "b3",
    observacion: "Esta pregunta es informativa. No suma al porcentaje total.",
    condicion: { preguntaId: "p10", valores: ["si", "parcialmente"] },
  },
];

export const USUARIOS_DEFAULT: User[] = [
  { id: "u1", email: "admin@test.com", password: "123456", role: "admin", nombre: "Administrador" },
  { id: "u2", email: "empresa@test.com", password: "123456", role: "empresa", nombre: "Empresa Demo" },
];
