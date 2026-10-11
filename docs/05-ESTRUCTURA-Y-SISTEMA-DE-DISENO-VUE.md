# 🎨 Estructura de Proyecto y Sistema de Diseño en Vue 3

Esta guía analiza en detalle la estructura de carpetas de **`src/`** en Nakama y define la metodología estándar para **organizar, escalar y modularizar el diseño (UI/UX) en aplicaciones modernas de Vue 3 con Tailwind CSS**.

---

## 🧭 PARTE 1: Radiografía de `src/` (¿Qué hace cada carpeta?)

El código fuente de Nakama está organizado según una **arquitectura por capas desacoplada**:

```
src/
├── assets/         → Recursos estáticos (imágenes WebP, logos, fuentes).
├── types/          → Contratos y definiciones TypeScript estrictas.
├── services/       → Capa de infraestructura (APIs externas, Supabase, AniList).
├── stores/         → Estado global en memoria y sincronización (Pinia).
├── composables/    → Lógica reactiva reutilizable (filtros, alertas, portapapeles).
├── components/     → Piezas de interfaz visual (Dumb Components y Layout).
│   ├── layout/     → Estructura de pantalla (PageContainer, MobileHeader).
│   ├── ui/         → Componentes genéricos de diseño (EmptyState, ScopeFilter).
│   ├── collection/ → Componentes de la vista de colección (ItemCard, SearchBar).
│   ├── dashboard/  → Componentes del dashboard (StatCard, StatusPillBar).
│   ├── calendar/   → Componentes de emisión semanal (DayFilter).
│   ├── items/      → Selectores del formulario de creación y detalle.
│   └── auth/       → Formularios y marcas de acceso.
├── views/          → Pantallas conectadas al Router (Smart Components / Orquestadores).
├── data/           → Mocks de datos de la colección para desarrollo local.
├── mocks/          → Mocks de autenticación y usuarios locales.
└── router/         → Definición de rutas, lazy-loading y guardas de navegación.
```

### Detalle Carpeta por Carpeta:

| Carpeta | Responsabilidad Única | Qué SÍ debe contener | Qué NUNCA debe contener |
| :--- | :--- | :--- | :--- |
| **`assets/`** | Activos multimedia del empaquetado. | Imágenes optimizadas (WebP, SVG, PNG), favicon, fuentes locales. | Archivos `.vue`, lógica TypeScript o estilos CSS globales. |
| **`types/`** | Modelos de datos y contratos TypeScript. | Interfaces, tipos de unión (`type ItemTipo`), contratos de base de datos. | Variables reactivas (`ref`), lógica de funciones o imports de UI. |
| **`services/`** | Comunicación con el mundo exterior (I/O). | Llamadas al cliente de Supabase, peticiones `fetch`/REST/GraphQL. | Reactividad de Vue (`ref`, `computed`), imports de Pinia o HTML. |
| **`stores/`** | Estado global y persistencia en memoria. | Stores de Pinia (`useItemsStore`, `useAuthStore`), caché de datos. | Marcado visual, selectores CSS o lógica de renderizado. |
| **`composables/`** | Lógica de comportamiento reutilizable. | Funciones `use*` con estado (`useItemFilters`, `useAlert`, `useClipboard`). | Componentes completos con `<template>` o llamadas directas a APIs sin pasar por stores/servicios. |
| **`components/`** | Presentación visual pura (Dumb / Presentational). | Botones, tarjetas, modales, barras, cabeceras, layouts. | Llamadas directas a bases de datos o lógica que bloquee la reusabilidad. |
| **`views/`** | Páginas enrutadas (Smart / Orquestadores). | Ensamblaje de componentes para una ruta específica (`CalendarView.vue`). | CSS kilométrico, ternarios complejos de estilo o algoritmos matemáticos inline. |
| **`router/`** | Mapeo de URL a vistas. | Rutas con `import()`, metadata (`requiresAuth`, `guestOnly`), guardas de sesión. | Componentes de interfaz o almacenamiento de datos. |
| **`data/` & `mocks/`** | Respaldo para desarrollo aislado. | Arrays de datos estáticos y usuarios simulados sin conexión. | Código productivo que deba persistirse en base de datos. |

---

## 🏛️ PARTE 2: Cómo Estructurar el Diseño en un Proyecto Vue 3

Cuando el objetivo principal es **estructurar el diseño de forma limpia y mantenible**, la mejor estrategia es combinar **Atomic Design Simplificado** con una **Organización por Dominios/Funcionalidades**.

### 1. La Jerarquía Visual de 4 Niveles

```
┌────────────────────────────────────────────────────────┐
│ NIVEL 4: Vistas / Páginas (src/views/)                 │
│         Orquestan la composición sin pintar CSS inline │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ NIVEL 3: Componentes de Dominio (src/components/feat/) │
│         Tarjetas, filtros específicos, barras de stats │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ NIVEL 2: UI Primitives / Átomos (src/components/ui/)   │
│         Botones base, inputs, badges, empty states     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ NIVEL 1: Tokens de Diseño (src/style.css o Tailwind)  │
│         Colores, tipografías, sombras, radios de borde │
└────────────────────────────────────────────────────────┘
```

---

### 2. Nivel 1: Tokens de Diseño (Design Tokens)

Antes de crear cualquier componente, define tu **vocabulario visual centralizado**. En Tailwind CSS v4 o mediante variables CSS nativas, nunca uses colores hexadecimales arbitrarios sueltos en el HTML (`bg-[#28a745]`).

**Regla:** Todo color, sombra o radio debe tener un nombre semántico:
* 🟢 `--zoro-green` / `text-green` (Énfasis / Acción principal)
* 🟡 `--gold` / `text-gold` (Distintivos especiales / Alertas)
* ⬛ `--bg-base`, `--bg-surface`, `--bg-card`, `--bg-elevated` (Capas de profundidad)
* 🔲 `--border-color`, `--border-default` (Delimitación sutil)

Si necesitas cambiar la identidad visual de la app, **solo tocas los tokens**, no los 50 componentes del proyecto.

---

### 3. Nivel 2: UI Primitives (Componentes de Diseño Puros)
Viven en **`src/components/ui/`**. Son agnósticos al negocio (no saben qué es un anime ni qué es una tripulación).

* **`BaseButton.vue`**: Maneja variantes visuales (`primary`, `secondary`, `danger`, `ghost`), tamaños (`sm`, `md`, `lg`) y estado de carga (`loading`).
* **`BaseBadge.vue`**: Etiquetas de estado (`success`, `warning`, `info`).
* **`EmptyState.vue`**: Contenedor de mensaje vacío con ícono y botón de acción.
* **`BaseModal.vue`**: Estructura de ventana emergente con fondo difuminado, escape con teclado y slot para cuerpo/pie.
* **`ScopeFilter.vue`**: Selector segmentado de opciones.

---

### 4. Nivel 3: Layout y Estructura Responsiva (Móvil vs Escritorio)

El error más común en diseño frontend es hacer que un mismo componente intente ser la barra lateral de PC y la barra inferior de teléfono (lo que vimos con `Sidebar.vue`).

#### El Patrón Recomendado: "Separación de Dispositivos"

En lugar de llenar un archivo de clases contradictorias (`h-screen max-md:h-[70px] flex-col max-md:flex-row max-md:order-3`), crea componentes especializados en `src/components/layout/`:

1. **`PageContainer.vue`**: Provee el ancho máximo, márgenes laterales, cabecera de página responsiva y spinner de carga unificado.
2. **`DesktopSidebar.vue`**: Solo visible en escritorio (`hidden md:flex`). Panel vertical con logo, perfil expandido y navegación completa.
3. **`MobileHeader.vue`**: Solo visible en móvil (`md:hidden`). Barra superior con efecto cristal (`backdrop-blur-md`), logo compacto y avatar desplegable.
4. **`MobileBottomNav.vue`**: Solo visible en móvil (`md:hidden`). Barra inferior fija con los 5 accesos principales y el botón central elevado.

**En tu `App.vue` queda una estructura limpia como el agua:**
```vue
<template>
  <div class="flex h-screen w-screen flex-col bg-bg-base overflow-hidden">
    <!-- 1. Cabecera móvil arriba -->
    <MobileHeader class="md:hidden" />

    <div class="flex flex-1 overflow-hidden">
      <!-- 2. Barra lateral en PC -->
      <DesktopSidebar class="max-md:hidden" />

      <!-- 3. Contenido principal -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- 4. Navegación móvil abajo -->
    <MobileBottomNav class="md:hidden" />
  </div>
</template>
```

---

### 5. Nivel 4: Componentes de Dominio (Feature Components)
Viven agrupados por funcionalidad dentro de `src/components/<feature>/`:
* `components/collection/ItemCard.vue`: Sabe cómo pintar una obra (portada, overlay, progreso, puntuación).
* `components/collection/SearchBar.vue`: Input de búsqueda con debounce y botón de limpiar.
* `components/dashboard/StatCard.vue`: Tarjeta con métrica numérica, ícono y color temático.
* `components/calendar/DayFilter.vue`: Botonera de días de la semana con badges de conteo y "Hoy".

**Regla de Oro:** Reciben datos estructurados por `props` y notifican interacciones con `emit('select', item)`. No hacen peticiones directas a la base de datos.

---

### 6. Sistema de Animaciones y Microinteracciones

Para que el diseño se sienta profesional y como una aplicación nativa, implementa tres tipos de retroalimentación:

#### A. Feedback Táctil Inmediato (Micro-animations)
En todos los botones interactivos y tarjetas:
```html
class="transition-all duration-200 active:scale-95 cursor-pointer hover:brightness-110"
```

#### B. Glassmorphism en Elementos Flotantes
En barras de navegación y modales sobrepuestos sobre el contenido:
```html
class="bg-bg-surface/85 backdrop-blur-md border-b border-white/5"
```

#### C. Transiciones Suaves entre Vistas
En `App.vue`, envolviendo el `<RouterView>` con `<Transition>`:
```vue
<RouterView v-slot="{ Component }">
  <Transition name="fade-page" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>
```
```css
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-page-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
```

---

## 📋 Resumen: Checklist de Diseño Limpio en Vue 3

1. **¿Dónde va este botón/modal?**
   * Si es genérico (sirve para cualquier proyecto) → `src/components/ui/`
   * Si es de layout (organiza la ventana o barra) → `src/components/layout/`
   * Si es de un módulo específico (muestra un anime, manga o tripulación) → `src/components/<modulo>/`
   * Si representa una pantalla en la URL → `src/views/`
2. **¿Cómo se comunica?**
   * Hacia abajo: **Props** (datos ya listos y formateados).
   * Hacia arriba: **Emits** (avisos de clics o cambios).
3. **¿Dónde vive la lógica compleja?**
   * Filtros, ordenaciones y cálculos → `src/composables/useItemFilters.ts`.
   * Datos compartidos y sesión → `src/stores/`.
4. **¿Cómo manejo el diseño móvil?**
   * Separa la barra superior y la inferior en componentes especializados en lugar de saturar un solo archivo con clases condicionales.

