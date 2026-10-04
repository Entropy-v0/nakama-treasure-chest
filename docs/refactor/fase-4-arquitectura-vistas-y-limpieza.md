# FASE 4: Arquitectura de Vistas (`src/views/`) y Purga de Código Muerto

> **Prioridad:** Media (Organización de Proyecto y Deuda de Mantenimiento)  
> **Objetivo:** Separar las pantallas o vistas de ruta de los componentes reutilizables, eliminar código duplicado obsoleto y depurar contratos heredados sin uso.

---

## 1. Problemas que resuelve esta fase

1. **Vistas mezcladas con componentes en la raíz de `src/components/` (Hallazgo A1 de la auditoría):**  
   Actualmente `Dashboard.vue`, `ItemList.vue`, `AddItem.vue`, `Login.vue`, `Register.vue` y `Calendar.vue` residen sueltos en `src/components/`, mientras que `CrewView.vue` está dentro de `src/components/crew/`. No hay distinción entre una página de ruta y una pieza de interfaz.
2. **Código muerto y duplicación masiva (Hallazgo A3 de la auditoría):**  
   `src/components/crew/CrewModal.vue` (431 líneas) quedó abandonado cuando se implementó `CrewView.vue`. No es importado en ninguna parte del proyecto y repite toda la lógica de invitaciones y tripulación.
3. **Contratos heredados no escuchados (Hallazgo A5 de la auditoría):**  
   `Sidebar.vue` y `Dashboard.vue` aún emiten `@change-view`, y `Login.vue`/`Register.vue` emiten `@login-success` y `@go-to-login`. Como `App.vue` utiliza `RouterView`, estos eventos y la prop `currentView` ya no son escuchados por nadie.
4. **Falsos composables (Hallazgo A8 de la auditoría):**  
   `useTypeMeta.js` contiene únicamente constantes de configuración visual y componentes de iconos, pero utiliza el prefijo `use*` reservado para funciones con reactividad y ciclo de vida. Además, `useItems.js` es un archivo de reexportación innecesario.

---

## 2. Acciones y Pasos de Implementación

### Paso 4.1: Crear el Directorio `src/views/` y Migrar Vistas de Ruta
Mover las vistas orquestadoras:
* `src/components/Dashboard.vue` ➔ `src/views/DashboardView.vue`
* `src/components/ItemList.vue` ➔ `src/views/CollectionView.vue`
* `src/components/AddItem.vue` ➔ `src/views/AddItemView.vue`
* `src/components/Calendar.vue` ➔ `src/views/CalendarView.vue`
* `src/components/crew/CrewView.vue` ➔ `src/views/CrewView.vue`
* `src/components/Login.vue` ➔ `src/views/auth/LoginView.vue`
* `src/components/Register.vue` ➔ `src/views/auth/RegisterView.vue`

Actualizar las rutas dinámicas en `src/router/index.ts`:
```ts
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guestOnly: true } },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/collection', name: 'Collection', component: () => import('@/views/CollectionView.vue'), meta: { requiresAuth: true } },
  { path: '/calendar', name: 'Calendar', component: () => import('@/views/CalendarView.vue'), meta: { requiresAuth: true } },
  { path: '/crew', name: 'Crew', component: () => import('@/views/CrewView.vue'), meta: { requiresAuth: true } },
  { path: '/add', name: 'AddItem', component: () => import('@/views/AddItemView.vue'), meta: { requiresAuth: true } },
]
```

### Paso 4.2: Eliminar Archivos Obsoletos y Reexportaciones
* Eliminar `src/components/crew/CrewModal.vue`.
* Eliminar `src/composables/useItems.js` (todos los imports deben apuntar directamente a `src/composables/useItems.ts`).

### Paso 4.3: Mover Metadatos a `src/constants/itemMeta.ts`
Crear `src/constants/itemMeta.ts` para albergar `TIPOS`, `ESTADOS`, `STATUS_COLORS`, `TYPE_META` y `STATUS_META`.  
Depurar `useTypeMeta.js` y actualizar las importaciones en los componentes que lo consumían.

### Paso 4.4: Limpiar Emits y Props Muertos
* En `Sidebar.vue`: eliminar `props: { currentView }` y `emit('change-view')`. La barra lateral únicamente necesita inspeccionar la ruta activa con `useRoute()` y navegar con `router.push()`.
* En `Dashboard.vue`: retirar `emit('change-view')`.
* En `LoginView.vue` y `RegisterView.vue`: retirar emits innecesarios.

---

## 3. Criterios de Aceptación y Verificación

1. Comprobar que el árbol de directorios quede estructurado:
   ```text
   src/
   ├── views/         (solo vistas orquestadoras de ruta)
   ├── components/    (solo piezas presentacionales y modales)
   ├── constants/     (constantes y metadatos no reactivos)
   ├── composables/   (lógica reactiva reutilizable)
   ├── stores/        (Pinia)
   ├── services/      (llamadas API y Supabase)
   └── types/         (TypeScript)
   ```
2. Ejecutar `pnpm run build`: todas las rutas deben resolver sus imports y compilar sin errores.
3. Navegar por toda la aplicación en el navegador y verificar que la navegación entre páginas funcione exactamente igual.
