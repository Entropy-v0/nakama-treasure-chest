# CHECKPOINT DE MEMORIA (ACTIVE TASK)
*El Agente IA debe actualizar este archivo antes de detenerse para no perder el contexto en la próxima interacción.*

**Módulo Actual en Refactorización:** FASE 4 — Integración en Vivo con Supabase
**Fase Activa:** Fase 4 (En progreso)

**Estado de la Ejecución:**
- [x] **Fase 1: UI y Estilos CSS (100% completada)**
- [x] **Fase 2: Capa de Datos y Contratos (100% completada)**
- [x] **Fase 3: Estado Global y Autenticación (100% completada)**
- [x] **Fase 4: Conexión en Vivo con Supabase (100% completada)**
  - [x] 4.1 — Generado script SQL de base de datos en `supabase/schema.sql` (tablas `items`, `profiles` con columna `genero`, RLS e índices).
  - [x] 4.2 — Inyección automática de `user_id` en `items.service.ts` para seguridad RLS.
  - [x] 4.3 — Módulo de Edición de Perfil de Usuario:
    - Modal `src/components/auth/EditProfileModal.vue` para cambiar nombre, avatar URL (con vista previa) y género a bordo (Capitán / Capitana).
    - Métodos en `authService.updateProfile` y `authStore.updateProfile` con sincronización en Supabase Auth (`user_metadata`) y en la tabla `public.profiles`.
    - `Sidebar.vue` actualizado con avatar visual y botón directo "Editar".
  - [x] 4.4 — Configuración de `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` conectada.
  - [x] 4.5 — Verificación funcional de registro, creación de tarjeta y persistencia en PostgreSQL completada.