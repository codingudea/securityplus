---
name: lovable-ui-components
description: >
  Patrones de UI con shadcn/ui + Tailwind CSS para apps web y landing pages al
  estilo Lovable. Usar cuando: construir secciones de landing page (hero,
  features, pricing, FAQ, CTA, footer), implementar formularios, cards,
  modales, tablas, navegación, o cualquier componente de interfaz. Incluye
  theming con CSS variables, dark mode, responsive design, y patrones de
  accesibilidad básica.
---

# Lovable UI Components

## CSS Variables base (src/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

## Componentes shadcn a instalar por caso de uso

```bash
# Base para cualquier proyecto
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge

# Para formularios
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox

# Para navegación y layout
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add separator

# Para feedback al usuario
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert

# Para datos
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
```

## Layout base de página

```typescript
// src/components/layout/Layout.tsx
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
```

## Header con navegación responsive

```typescript
// src/components/layout/Header.tsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="text-xl font-bold text-primary">
          Logo
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button size="sm">Comenzar</Button>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Button className="w-full">Comenzar</Button>
        </div>
      )}
    </header>
  );
};

export default Header;
```

## Sección Hero

```typescript
// src/components/sections/Hero.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-6">
          Novedad — Versión 2.0 disponible
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Título principal{" "}
          <span className="text-primary">diferenciador</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Descripción clara del valor. Dos o tres líneas máximo. Qué hace,
          para quién, por qué importa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2">
            Acción principal <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Acción secundaria
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

## Sección Features (grid de cards)

```typescript
// src/components/sections/Features.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, BarChart } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Rápido",
    description: "Descripción concreta del beneficio, no del feature.",
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Descripción concreta del beneficio, no del feature.",
  },
  {
    icon: BarChart,
    title: "Analíticas",
    description: "Descripción concreta del beneficio, no del feature.",
  },
];

const Features = () => {
  return (
    <section id="servicios" className="py-24 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por qué elegirnos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Subtítulo de sección. Directo, sin relleno.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
```

## Formulario de contacto con validación

```typescript
// src/components/sections/ContactForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.mensaje) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // lógica de envío aquí (Supabase, API, etc.)
      toast({ title: "Mensaje enviado correctamente" });
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contacto" className="py-24 px-4">
      <div className="container mx-auto max-w-lg">
        <h2 className="text-3xl font-bold text-center mb-10">Contáctanos</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              placeholder="¿En qué podemos ayudarte?"
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
```

## CTA final

```typescript
// src/components/sections/CTA.tsx
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          ¿Listo para empezar?
        </h2>
        <p className="text-primary-foreground/80 mb-8 text-lg">
          Una sola línea de propuesta de valor. Sin ambigüedad.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="font-semibold"
        >
          Comenzar ahora
        </Button>
      </div>
    </section>
  );
};

export default CTA;
```

## Footer minimal

```typescript
// src/components/layout/Footer.tsx
const Footer = () => {
  return (
    <footer className="border-t py-8 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</span>
        <div className="flex gap-6">
          <a href="/privacidad" className="hover:text-foreground transition-colors">
            Privacidad
          </a>
          <a href="/terminos" className="hover:text-foreground transition-colors">
            Términos
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

## Reglas de diseño

- Contenedor máximo: `container mx-auto` con `px-4` en los lados
- Espaciado vertical entre secciones: `py-24` (desktop) — no usar menos de `py-16`
- Jerarquía tipográfica: h1 `text-4xl md:text-6xl`, h2 `text-3xl md:text-4xl`, body `text-base`
- Colores siempre desde variables (`text-primary`, `bg-muted`) — nunca hardcodeados
- Imágenes: siempre con `alt` descriptivo, `object-cover` en contenedores de tamaño fijo
- Botón WhatsApp flotante: `fixed bottom-6 right-6 z-50`

## Errores frecuentes de UI

- Usar `<form>` en artefactos React de Claude — usar `onSubmit` en `<div>` o directamente en `<form>` con `e.preventDefault()`
- `100vh` en móvil iOS — usar `min-h-screen` o `min-h-[100dvh]`
- Anidar `<button>` dentro de `<button>` — inválido en HTML, rompe accesibilidad
- `gap-*` en flex sin `flex` declarado — no tiene efecto
- Olvidar `<Toaster />` en App.tsx al usar `useToast`
