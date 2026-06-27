---
name: lovable-supabase
description: >
  Integración de Supabase en proyectos React + TypeScript al estilo Lovable.
  Usar cuando: configurar cliente Supabase, implementar auth (signUp, signIn,
  OAuth, sesión), queries a base de datos, políticas RLS, storage, realtime
  con patrón singleton. Incluye diferencias críticas entre Supabase Cloud y
  auto-hosted (VPS). Cubre errores frecuentes de CPU por subscripciones mal
  implementadas.
---

# Lovable Supabase Integration

## Cliente — la regla más importante

El cliente Supabase DEBE ser un singleton. Crear múltiples instancias destruye
las subscripciones realtime y satura la CPU del servidor.

```typescript
// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Faltan variables de entorno de Supabase");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Importar SIEMPRE desde `@/integrations/supabase/client`, nunca crear una segunda instancia.

## Variables de entorno

```bash
# .env.local
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Para Supabase auto-hosted en VPS (Hostinger, etc.):
```bash
VITE_SUPABASE_URL=https://tu-dominio.com  # o IP:puerto si no hay dominio
VITE_SUPABASE_ANON_KEY=tu-anon-key-del-panel-auto-hosted
```

**Diferencia crítica con auto-hosted:** Las migraciones NO se corren con
`supabase db push` apuntando a tu VPS — eso asume Supabase Cloud.
En auto-hosted las migraciones se aplican directamente en PostgreSQL vía
`psql` o el panel de Studio en tu instancia.

## Auth

```typescript
// src/hooks/use-auth.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, session, isLoading, signUp, signIn, signOut };
};
```

## Queries a base de datos

```typescript
// Lectura simple
const { data, error } = await supabase
  .from("tabla")
  .select("*")
  .order("created_at", { ascending: false });

// Lectura con filtros
const { data, error } = await supabase
  .from("tabla")
  .select("id, nombre, email")
  .eq("activo", true)
  .limit(20);

// Insertar
const { data, error } = await supabase
  .from("tabla")
  .insert({ nombre: "Ejemplo", user_id: user.id })
  .select()
  .single();

// Actualizar
const { error } = await supabase
  .from("tabla")
  .update({ nombre: "Nuevo nombre" })
  .eq("id", id);

// Eliminar
const { error } = await supabase
  .from("tabla")
  .delete()
  .eq("id", id);
```

## Hook de query con estado

```typescript
// src/hooks/use-items.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  id: string;
  nombre: string;
  created_at: string;
}

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setItems(data ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, isLoading, error, refetch: fetchItems };
};
```

## Realtime — patrón singleton (CRÍTICO)

El error más frecuente: crear canales con nombres dinámicos (`Math.random()`)
impide el reuso y acumula subscripciones hasta saturar la CPU del servidor.

```typescript
// ❌ MAL — crea un canal nuevo en cada render
const channel = supabase.channel(`items-${Math.random()}`);

// ✅ BIEN — nombre fijo, reutilizable
const CHANNEL_NAME = "items-changes";

export const useItemsRealtime = (onUpdate: () => void) => {
  useEffect(() => {
    const channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
};
```

## Políticas RLS básicas

```sql
-- Habilitar RLS en la tabla
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede leer sus registros
CREATE POLICY "usuarios leen sus items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el dueño puede insertar
CREATE POLICY "usuarios insertan sus items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede actualizar
CREATE POLICY "usuarios actualizan sus items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo el dueño puede eliminar
CREATE POLICY "usuarios eliminan sus items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

## Storage

```typescript
// Subir archivo
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;
  return data;
};

// Obtener URL pública
const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Eliminar archivo
const deleteFile = async (bucket: string, paths: string[]) => {
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
};
```

## Índices recomendados para rendimiento

```sql
-- Siempre indexar user_id si filtras por usuario
CREATE INDEX idx_items_user_id ON items(user_id);

-- Indexar campos de orden frecuente
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Índice compuesto para queries combinadas
CREATE INDEX idx_items_user_created ON items(user_id, created_at DESC);
```

## Errores frecuentes

- **CPU saturada en servidor:** Casi siempre son subscripciones realtime acumuladas.
  Verificar con `SELECT * FROM pg_stat_activity` en el editor SQL del panel.
- **Error 401 en queries:** RLS activo sin política. Agregar política o deshabilitar
  RLS temporalmente para debug.
- **Tipos no generados:** Correr `supabase gen types typescript --project-id <id>`
  para Supabase Cloud. En auto-hosted, usar `--db-url postgresql://...`.
- **Variables de entorno vacías en Vercel:** `VITE_*` deben estar en Vercel Settings >
  Environment Variables, no solo en `.env.local`.
