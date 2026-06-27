---
name: lovable-react-stack
description: >
  Stack base React + Vite + TypeScript + Tailwind CSS + shadcn/ui, replicando
  la estructura de carpetas y convenciones de Lovable. Usar cuando: scaffolding
  de proyectos nuevos, creación de componentes, configuración de rutas, o
  cualquier tarea frontend en este stack. Cubre estructura de proyecto, aliases
  de paths, configuración de Vite, patrones de componentes, y routing con
  React Router v6.
---

# Lovable React Stack

Este stack replica la arquitectura que genera Lovable en proyectos pre-mayo 2026.
Para proyectos nuevos en Lovable (post mayo 2026), ver stack TanStack Start.

## Estructura de carpetas

```
project-root/
├── src/
│   ├── components/
│   │   ├── ui/            ← Componentes shadcn (generados por CLI, NO editar)
│   │   ├── layout/        ← Header, Footer, Sidebar, Navigation
│   │   ├── sections/      ← Secciones de página (Hero, Features, Pricing, FAQ)
│   │   └── shared/        ← Componentes reutilizables cross-feature
│   ├── pages/             ← Vistas principales (una por ruta)
│   ├── hooks/             ← Custom hooks (use-*.ts)
│   ├── lib/
│   │   └── utils.ts       ← cn() y helpers generales
│   ├── types/             ← Interfaces y tipos TypeScript
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts  ← Cliente Supabase (importar SIEMPRE de aquí)
│   │       └── types.ts   ← Tipos generados de la DB
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.ts
├── components.json        ← Configuración shadcn
└── package.json
```

## Dependencias base

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "lucide-react": "^0.462.0",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
```

## vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

## components.json (shadcn)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## src/lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Patrón de componente

```typescript
// src/components/shared/ExampleCard.tsx
import { cn } from "@/lib/utils";

interface ExampleCardProps {
  title: string;
  description?: string;
  className?: string;
}

const ExampleCard = ({ title, description, className }: ExampleCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default ExampleCard;
```

## Patrón de hook

```typescript
// src/hooks/use-example.ts
import { useState, useEffect } from "react";

interface UseExampleOptions {
  initialValue?: string;
}

export const useExample = ({ initialValue = "" }: UseExampleOptions = {}) => {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // lógica aquí

  return { value, setValue, isLoading };
};
```

## App.tsx con React Router v6

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Convenciones obligatorias

- Alias `@/` siempre en lugar de rutas relativas `../../`
- Componentes shadcn NUNCA se editan directamente en `ui/`; se wrappean en `shared/`
- Un componente por archivo, nombre del archivo = nombre del componente en PascalCase
- Hooks siempre con prefijo `use-` en kebab-case como nombre de archivo
- `cn()` para toda combinación de clases Tailwind condicionales
- Props tipadas con interface, no con `type`, excepto para unions

## Errores frecuentes

- Importar Supabase desde cualquier lugar que no sea `@/integrations/supabase/client` rompe el patrón de singleton
- Usar `tailwindcss-animate` con Tailwind v4 genera errores de build — esta skill es para Tailwind v3
- Mezclar lock files (bun.lockb + pnpm-lock.yaml) causa fallos en Vercel — usar solo uno
- `100vw`/`100vh` en unidades para PDF export causa overflow — usar `w-full`/`min-h-screen`
