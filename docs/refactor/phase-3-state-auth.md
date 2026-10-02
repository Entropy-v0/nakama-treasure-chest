# FASE 3: ESTADO GLOBAL Y AUTENTICACIÓN

**Objetivo:** Manejar la sesión del usuario con Supabase Auth, Pinia y Vue Router.

**Estado:** 100% COMPLETADO ✅

**Detalles de la Implementación:**
1. **Store de Sesión Pinia (`src/stores/auth.ts`):**
   - Configurado con Composition API (`ref`, `computed`).
   - Estado de sesión, usuario, flags (`isLoading`, `isInitialized`), y control de errores.
   - Acciones reactivas: `initialize()`, `signIn()`, `signUp()`, `signOut()`.
   - Soporte híbrido: modo live con Supabase real y fallback mock automático cuando las credenciales no están configuradas en `.env`.

2. **Listener Global de Autenticación:**
   - Implementado en `src/services/supabase/auth.service.ts` y conectado en el store de Pinia.
   - Reacciona en tiempo real a eventos de cambio de sesión (`SIGNED_IN`, `SIGNED_OUT`, token refresh).

3. **Navigation Guards con Vue Router (`src/router/index.ts`):**
   - Rutas configuradas con dynamic imports (code-splitting):
     - Públicas / Invitado: `/login`, `/register` (`meta: { guestOnly: true }`).
     - Protegidas: `/dashboard`, `/collection`, `/add` (`meta: { requiresAuth: true }`).
   - `router.beforeEach` asegura inicialización previa de sesión y previene accesos no autenticados (redirige a `/login?redirect=...`).

4. **Pantalla de Carga y Feedback de Sesión:**
   - Componente `src/components/ui/LoadingScreen.vue` con animación brand de Nakama (logo, pulso y dots).
   - Bloqueo visual elegante mientras se valida la persistencia de la sesión en el inicio.

5. **Componentes Actualizados:**
   - `App.vue`: RouterView y layout condicional según estado de autenticación.
   - `Login.vue`: Conectado a `authStore.signIn()` y redirección dinámica.
   - `Register.vue`: Conectado a `authStore.signUp()`, bienvenida y redirección al dashboard.
   - `Sidebar.vue`: Muestra nombre del usuario autenticado, navegación por rutas y botón de "Cerrar sesión" funcional.
   - `Dashboard.vue` y `AddItem.vue`: Navegación nativa con `useRouter()`.