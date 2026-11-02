# 🏴‍☠️ Nakama Treasure Chest - Gestor de Contenido

> Plataforma web moderna e íntima diseñada para organizar, rastrear y disfrutar de nuestras colecciones multimedia (Anime, Manga, Series, Películas y Libros), compartiendo historias y momentos especiales en pareja.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-4.0+-FFE564?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nakama-gestor-personal.vercel.app)

🌐 **Demo en Vivo:** [https://nakama-gestor-personal.vercel.app](https://nakama-gestor-personal.vercel.app)

---

## 📖 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías y Stack](#-tecnologías-y-stack)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso y Scripts Disponibles](#-uso-y-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Dedicatoria](#-dedicatoria)

---

## ✨ Características Principales

- 🎬 **Gestión Multimedia Multi-categoría:** Seguimiento detallado de Anime, Manga, Series, Películas y Libros. Controla estados (*Viendo*, *Pendiente*, *Completado*, *En Pausa*, *Abandonado*), progreso de capítulos, valoraciones personales, notas y portadas.
- 👥 **Espacio Compartido (Tripulación):** Gestión sincronizada de listas y recomendaciones conjuntas para disfrutar del contenido en pareja.
- 📅 **Calendario Semanal de Emisiones:** Organización de series y animes por día de la semana (lunes a domingo) para no perderse ningún estreno ni maratón juntos.
- 🔍 **Búsqueda Integrada de Medios:** Localiza títulos rápidamente con autocompletado y precarga de metadatos, junto con compresión optimizada de portadas.
- 📊 **Panel de Control y Métricas:** Dashboard interactivo con estadísticas de progreso, actividad reciente y resumen visual de la colección.
- 🛡️ **Seguridad y Persistencia:** Autenticación de usuarios vía Supabase Auth y protección de datos a nivel de fila con PostgreSQL Row Level Security (RLS).
- ⚡ **Modo Mock / Aislamiento Local:** Capacidad de ejecutar y probar la aplicación en local con datos simulados sin depender de una base de datos activa (`VITE_USE_MOCK=true`).

---

## 🛠️ Tecnologías y Stack

- **Frontend:** [Vue 3](https://vuejs.org/) (Composition API con `<script setup>`) y [TypeScript](https://www.typescriptlang.org/)
- **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/)
- **Enrutamiento:** [Vue Router](https://router.vuejs.org/)
- **Estilos e Iconos:** [Tailwind CSS v4](https://tailwindcss.com/) y [Lucide Icons](https://lucide.dev/) (`@lucide/vue`)
- **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth y Storage)
- **Herramienta de Construcción:** [Vite](https://vitejs.dev/)
- **Testing y Calidad de Código:** [Vitest](https://vitest.dev/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) y [vue-tsc](https://github.com/vuejs/language-tools)
- **Despliegue y Hosting:** [Vercel](https://vercel.com/)
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/) (o `npm` / `yarn`)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de contar con las siguientes herramientas instaladas:

- **Node.js:** Versión 18.0 o superior (recomendado Node.js 20+ LTS).
- **Gestor de paquetes:** [pnpm](https://pnpm.io/) (recomendado), `npm` o `yarn`.
- **Cuenta de Supabase:** Proyecto en [Supabase](https://supabase.com/) (opcional si se utiliza el modo mock).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para clonar y ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/Entropy-v0/nakama-treasure-chest.git
cd nakama-treasure-chest
```

### 2. Instalar dependencias

```bash
# Con pnpm (recomendado)
pnpm install

# Con npm
npm install
```

### 3. Configurar variables de entorno

Copia la plantilla de entorno a un archivo local:

```bash
cp .env.example .env.local
```

Configura tus variables en `.env.local` según el entorno:

```env
# Configuración de Supabase (Producción / Backend real)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Modo Mock / Aislamiento local (true = usa datos mock sin conectar a Supabase)
VITE_USE_MOCK=false
```

### 4. Inicializar la base de datos (solo para Supabase real)

Si utilizas un backend real de Supabase, ejecuta el script ubicado en [supabase/schema.sql](file:///home/entropy/Olimpo/Proyectos/Proyectos-Personales/Nakama-Gestor-Contenido/supabase/schema.sql) en el **SQL Editor** de tu consola de Supabase para generar las tablas, relaciones y políticas de RLS necesarias.

---

## 💻 Uso y Scripts Disponibles

El proyecto cuenta con scripts configurados para el desarrollo diario y mantenimiento:

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo local con recarga rápida (HMR). |
| `pnpm build` | Compila y optimiza la aplicación para producción en la carpeta `dist/`. |
| `pnpm preview` | Previsualiza localmente la compilación de producción. |
| `pnpm test` | Ejecuta la suite de pruebas unitarias con Vitest. |
| `pnpm test:watch` | Ejecuta las pruebas unitarias en modo interactivo/vigilante. |
| `pnpm type-check` | Ejecuta la comprobación estática de tipos con `vue-tsc`. |
| `pnpm lint` | Analiza el código fuente con ESLint. |
| `pnpm format` | Formatea el código con Prettier. |

### Iniciar entorno de desarrollo

```bash
pnpm dev
```

La aplicación estará accesible por defecto en `http://localhost:5173`.

---

## 📂 Estructura del Proyecto

El código está estructurado bajo una arquitectura limpia y modular:

```text
nakama-treasure-chest/
├── docs/                   # Documentación técnica, arquitectura y notas
├── public/                 # Archivos estáticos públicos
├── src/
│   ├── assets/             # Recursos multimedia e imágenes
│   ├── components/         # Componentes organizados por dominio
│   │   ├── auth/           # Formularios y modales de autenticación y perfil
│   │   ├── calendar/       # Filtros y vistas de calendario semanal
│   │   ├── collection/     # Tarjetas, grillas y barras de búsqueda del catálogo
│   │   ├── dashboard/      # Tarjetas de métricas y widgets de resumen
│   │   ├── items/          # Selectores de tipo, estado, días y modales de detalle
│   │   ├── layout/         # Barra lateral, navegación y contenedores base
│   │   └── ui/             # Componentes base reutilizables (Botones, Inputs, Modales)
│   ├── composables/        # Hooks reactivos reutilizables (useItemForm, useCollectionData, etc.)
│   ├── constants/          # Constantes y metadatos de elementos
│   ├── data/               # Datos mock para desarrollo local
│   ├── router/             # Definición y guardas de rutas con Vue Router
│   ├── services/           # Clientes HTTP, integración con Supabase y APIs externas
│   ├── stores/             # Gestión de estado global con Pinia (auth, items, crew)
│   ├── types/              # Contratos y tipos TypeScript
│   ├── utils/              # Validadores, compresor de imágenes y utilidades
│   ├── views/              # Vistas principales de página
│   ├── App.vue             # Componente raíz
│   └── main.ts             # Punto de entrada de la aplicación
├── supabase/               # Esquemas SQL, migraciones y configuración de Supabase
├── tests/                  # Pruebas unitarias con Vitest
├── .env.example            # Plantilla de variables de entorno
└── package.json            # Dependencias y scripts del proyecto
```

---

## ❤️ Dedicatoria

<div align="center">

> *"Entre tantas historias, mundos por descubrir y aventuras por vivir...  
> **mi mayor tesoro eres tú.**"*  


</div>
