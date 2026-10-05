# 🏛️ Auditoría Arquitectónica Frontend (Post-Refactorización) — Nakama

> **Fecha:** 2026-10-04  
> **Rama auditada:** `feature/calendario` (base actualizada con `main` tras Fases 0 a 6 y unificación de filtros)  
> **Stack:** Vue 3.5 (`<script setup lang="ts">`) · Vite 8 (Rolldown) · Pinia · Vue Router · Supabase JS v2 · Tailwind CSS v4  
> **Documento de referencia previo:** [Auditoría Arquitectónica Inicial (2026-10-04)](./2026-10-04-auditoria-arquitectura.md)  
> **Guía viva de arquitectura:** [04-GUIA-CREAR-VISTAS-Y-MODULOS.md](../04-GUIA-CREAR-VISTAS-Y-MODULOS.md)

---

## 📊 0. Comparativa de Métricas: Antes vs Ahora

| Métrica | Auditoría Inicial (Pre-Refactor) | Estado Actual (Post-Refactor) | Evolución |
|---|:---:|:---:|:---:|
| **Componentes `.vue` con `lang="ts"`** | `0 / 27` (0 %) | **`25 / 25` (100 %)** | 🟢 **+100 % tipado estricto** |
| **Archivos `.js` en `src/`** | 5 archivos | **2 archivos** (`main.js`, `useTypeMeta.js`) | 🟢 **−60 % código sin tipar** |
| **Peso total de imágenes (Assets)** | **8,25 MB** | **622 KB** | 🟢 **−92,5 % peso (WebP)** |
| **Build de producción (`vite build`)** | ❌ **FALLABA** (Calendar vacío) | ✅ **EXITOSO (~500 ms)** | 🟢 **100 % funcional** |
| **Verificación de tipos (`vue-tsc`)** | ❌ No existía herramienta | ✅ **`pnpm run type-check` (0 errores)** | 🟢 **Validación estricta activa** |
| **Organización de vistas (`src/views/`)** | ❌ Inexistente (mezcladas en `components/`) | ✅ **100 % en `src/views/*View.vue`** | 🟢 **Arquitectura ordenada** |
| **Código muerto (`CrewModal.vue`)** | 431 líneas huérfanas | **0 líneas** (eliminado) | 🟢 **Deuda técnica eliminada** |
| **Pasamanos redundantes (`useItems`, `useCrew`, etc.)** | 4 archivos pasamanos | **0 archivos pasamanos** (eliminados) | 🟢 **Acceso directo a Pinia** |
| **Motor de filtrado** | Disperso en 4 archivos | **1 archivo central (`useItemFilters.ts`)** | 🟢 **DRY absoluto** |

---

## 🏆 1. Resumen Ejecutivo de Salud del Código

| Pilar | Antes | Ahora | Diagnóstico Actual |
|---|:---:|:---:|---|
| **Mantenibilidad** | 5 / 10 | **8.5 / 10** | **Excelente progreso.** Se crearon `src/views/`, `useItemFilters.ts` como motor único de filtrado, y se eliminaron los composables pasamanos (`useItems.ts`, `useCrew.ts`, `useCalendar.ts`). Vistas como `CalendarView.vue` e `ItemListView.vue` quedaron compactas y declarativas. Resta modularizar el formulario de `AddItemView` y el monolito de `CrewView` (postergado intencionalmente para la siguiente fase). |
| **Tipado y Rigor** | 2 / 10 | **8.5 / 10** | **Salto radical.** El 100% de los SFC de Vue ahora usan `<script setup lang="ts">`. `vue-tsc --noEmit` compila con cero errores. El build es reproducible y robusto. |
| **Rendimiento** | 5 / 10 | **9.0 / 10** | **Optimizado para producción.** Fondos convertidos a WebP con ahorro del 92.5%, carga diferida de vistas en rutas, `isLoaded` para caché de Pinia sin peticiones repetidas, y filtrado en memoria sin latencia de red. |

---

## 🔍 2. Estado de los Hallazgos Críticos Previos (C1 a C9)

| Hallazgo Inicial | Descripción del Problema | Estado Actual | Resolución Aplicada |
|---|---|:---:|---|
| **C1** | Build roto por `Calendar.vue` vacío | 🟢 **RESUELTO** | `CalendarView.vue` implementado, estilizado y compilando en producción. |
| **C2** | TypeScript decorativo sin compilador | 🟢 **RESUELTO** | `typescript` y `vue-tsc` configurados con scripts de npm; 100% SFCs en TS. |
| **C3** | Tipo `Database` incompleto para tripulación | 🟡 **PARCIAL** | Mapeo tipado en `types/crew.ts` y `types/items.ts`; falta ejecutar `npx supabase gen types` para sincronización 100% automática con PostgreSQL. |
| **C4** | Mutación directa de props en `ItemDetailsModal` | 🟢 **RESUELTO** | Eliminada la mutación de `props.item`; ahora delega a `itemsStore.updateItem()` con reactividad de Pinia. |
| **C5** | Carrera en `initialize()` y await en callback de auth | 🟢 **RESUELTO** | Promesa `initPromise` idempotente y llamadas diferidas fuera del listener. |
| **C6** | Fuga de sesión y estado al cerrar cuenta | 🟢 **RESUELTO** | `itemsStore` y `crewStore` observan `authStore.user?.id` y ejecutan `reset()` automático al cambiar de usuario. |
| **C7** | Peticiones redundantes en cada navegación y token | 🟢 **RESUELTO** | Eliminado el listener redundante en `TOKEN_REFRESHED`; bandera `isLoaded` previene descargas innecesarias. |
| **C8** | 8 MB de imágenes en pantallas de auth | 🟢 **RESUELTO** | Imágenes convertidas a WebP (< 600 KB total), `logo.png` eliminado. |
| **C9** | Incoherencia en IDs de usuario mock | 🟢 **RESUELTO** | Módulo `src/mocks/mockUser.ts` con `MOCK_USER_ID` unificado. |

---

## 🧩 3. Diagnóstico de Antipatrones Residuales

### 3.1 Lo que se resolvió con éxito ✅
1. **Eliminación de la sobreingeniería de pasamanos:** Se erradicaron `useItems.ts`, `useItems.js`, `useCrew.ts` y `useCalendar.ts`. Las vistas consumen directamente `useItemsStore()` y `useCrewStore()` mediante `storeToRefs()`.
2. **Unificación DRY de filtrado:** `useItemFilters.ts` es ahora el único motor responsable de ámbito, tipos, estados, emisión semanal, paginación y búsqueda en memoria.
3. **Erradicación de código muerto:** Se eliminó `CrewModal.vue` (431 líneas).
4. **Vistas como Orquestadores:** `CalendarView.vue` pasó de tener lógica mezclada a ser una vista declarativa de 60 líneas que delega su UI a `DayFilter.vue`.

### 3.2 Deuda técnica remanente (Áreas a mejorar en futuras fases) ⏳

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INVENTARIO DE DEUDA TÉCNICA REMANENTE                                       │
├───────────────────┬──────────────┬──────────────────────────────────────────┤
│ Archivo           │ Líneas       │ Deuda Pendiente                          │
├───────────────────┼──────────────┼──────────────────────────────────────────┤
│ CrewView.vue      │ 723 líneas   │ Monolito con 7 secciones (postergado)    │
│ ItemDetailsModal  │ 573 líneas   │ Modo visualización y edición acoplados   │
│ AddItemView.vue   │ 460 líneas   │ Dropdown AniList y selector en template  │
│ DashboardView.vue │ 303 líneas   │ Modal "¿Qué vemos hoy?" incrustado       │
│ useTypeMeta.js    │ 53 líneas    │ Sigue en .js (debe ser constants/itemMeta)│
│ main.js           │ 18 líneas    │ Sigue en .js (debe ser main.ts)          │
└───────────────────┴──────────────┴──────────────────────────────────────────┘
```

1. **`CrewView.vue` (723 líneas - Reservado para refactor futuro):**
   * Contiene 7 subpantallas en el mismo HTML (creación, edición de nombre, invitaciones recibidas, enviadas, miembros, peligro).
   * *Acción futura:* Extraer a `src/components/crew/` (`CrewHeader.vue`, `CrewMemberList.vue`, `CrewInvitesSection.vue`, etc.).
2. **`DashboardView.vue` (Modal "¿Qué vemos hoy?" incrustado):**
   * El modal con dados y animación de sorteo ocupa ~80 líneas del template del Dashboard.
   * *Acción futura:* Extraer a `src/components/dashboard/RandomPickerModal.vue`.
3. **`AddItemView.vue` (Formulario con lógica de presentación inline):**
   * El autocompletado flotante de AniList y el selector de días de emisión están escritos en el template.
   * *Acción futura:* Extraer a `MediaAutocomplete.vue` y `DayOfWeekSelector.vue`.
4. **Archivos `.js` restantes:**
   * `src/main.js` y `src/composables/useTypeMeta.js` son los dos únicos archivos que restan por migrar a `.ts`.

---

## 📋 4. Plan de Acción Recomendado para la Siguiente Iteración

1. **Paso 1: Migración de los 2 archivos `.js` restantes (0.5 h):**
   * Convertir `src/main.js` a `src/main.ts` y actualizar `index.html`.
   * Convertir `src/composables/useTypeMeta.js` a `src/constants/itemMeta.ts`.
2. **Paso 2: Extracción de modales incrustados (1 h):**
   * Extraer el sorteo de `DashboardView.vue` a `src/components/dashboard/RandomPickerModal.vue`.
   * Extraer el paginador de `ItemListView.vue` a `src/components/ui/PaginationBar.vue`.
3. **Paso 3: Modularización de `CrewView.vue` (3 h - Cuando se decida abordar):**
   * Descomponer las 723 líneas en 5 subcomponentes independientes dentro de `src/components/crew/`.

---

## 🎯 Conclusión
El proyecto ha dado un **salto de madurez cualitativo**. La base de código ya no es frágil: compila en tiempo récord, cuenta con tipado estricto en el 100% de sus componentes Vue, no duplica lógica de filtrado ni peticiones a la red, y cuenta con una arquitectura limpia documentada paso a paso.

