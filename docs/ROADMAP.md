# 🗺️ ROADMAP Y PLANES DE EVOLUCIÓN: NAKAMA

Este documento establece la hoja de ruta estratégica para la evolución de **Nakama**, adaptada a las necesidades reales del proyecto.

---

## 🧭 Contexto Actual y Objetivo Inmediato

El proyecto se encuentra en su versión **v1.0 (MVP Funcional)** y será desplegado de forma gratuita en **Vercel** (`*.vercel.app`) para ser utilizado en el día a día por **dos personas (el Capitán y la Capitana)** para coordinar y gestionar lo que ven y leen juntos e individualmente.

---

## 🚢 FASE 1: Modo Pareja ("Dúo Nakama") & Despliegue en Vercel

> **Objetivo:** Optimizar la experiencia para dos usuarios compartiendo biblioteca, automatizar la carga de contenido y poner la aplicación en producción en Vercel sin costes.
> 
> 📌 **Plan de Ejecución Detallado para Agentes:** Consulta el paso a paso atómico en [`docs/FASE-1-PLAN.md`](file:///home/entropy/Olimpo/Proyectos/Exlibris-gestor-de-libros/docs/FASE-1-PLAN.md).

### 1.1 Guía de Despliegue en Vercel (Paso a Paso)
- **Configuración SPA (`vercel.json`):**
  Evitar errores 404 al recargar rutas de Vue Router (`/dashboard`, `/login`, etc.) mediante reescritura hacia `index.html`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Variables de Entorno en Vercel:**
  Configurar en el panel de Vercel (*Settings -> Environment Variables*):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Ajustes en Supabase Auth:**
  En *Supabase -> Authentication -> URL Configuration*:
  - **Site URL:** `https://tu-proyecto.vercel.app`
  - **Redirect URLs:** `https://tu-proyecto.vercel.app/**`
  - Desactivar *Confirm email* (para registro y acceso instantáneo sin configurar servidor de correo SMTP).

---

### 1.2 Sistema Social de Tripulaciones ("Crews") & Vinculación de Cuentas

En lugar de un enlace fijo entre dos cuentas, se implementa una arquitectura escalable de **"Tripulaciones" (Crews)**. Esto resuelve de inmediato la necesidad de compartir listas en pareja y sienta las bases para conectar a grupos de amigos o comunidades en el futuro.

#### A. Flujo de Invitación y Conexión:
1. **Búsqueda / Invitación por Usuario o Correo:**
   * El usuario dispone de una sección en su perfil o sidebar llamada *"Mi Tripulación"*.
   * Puede ingresar el nombre de usuario o correo electrónico de la persona que desea invitar (su pareja o amigos).
2. **Notificación y Aceptación:**
   * **Si el usuario ya está registrado:** Recibe una notificación/invitación interactiva dentro de la aplicación (*"El Capitán X te ha invitado a unirte a su tripulación"*).
   * **Si aún no está registrado:** Se genera un enlace de invitación único (o correo de invitación) para que, al registrarse, quede automáticamente vinculado a la tripulación.
3. **Fusión / Vinculación de Cuentas:**
   * Al aceptar la invitación, ambas cuentas quedan unidas bajo la misma **Tripulación** (ej: *"Los Sombrero de Paja"* o el nombre que elijan).
   * Cada usuario conserva su propio perfil, avatar, estadísticas e historial personal intactos.

#### B. Modelo de Datos y Seguridad (PostgreSQL + RLS):
* **Tabla `crews`:** `id, name, created_by, created_at`
* **Tabla `crew_members`:** `crew_id, user_id, role ('capitan' | 'oficial' | 'nakama'), joined_at`
* **Tabla `crew_invites`:** `id, crew_id, inviter_id, invitee_email, status ('pending' | 'accepted' | 'declined'), token`
* **Ampliación en tabla `items`:**
  * Columna `crew_id (UUID, NULLable)`:
    * `crew_id IS NULL`: Obra de carácter **Personal** (solo visible para quien la creó).
    * `crew_id IS NOT NULL`: Obra de la **Tripulación** (visible para todos los miembros conectados).
* **Política RLS en Supabase:**
  * Un usuario puede leer y gestionar obras si:
    `auth.uid() = items.user_id OR items.crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())`

#### C. Experiencia de Usuario (UI/UX en Dashboard):
* **Filtros de Visibilidad:**
  * Pestañas en el Dashboard: `[ 👥 Para ver juntos / Tripulación ]` | `[ 👤 Solo mío ]` | `[ 🌐 Todo ]`.
* **Atribución de Contenido ("Propuesto por"):**
  * La tarjeta de la obra muestra un badge con el avatar y nombre del usuario que sugirió o agregó la obra.
* **Selector Aleatorio "¿Qué vemos hoy?":**
  * Un botón que sortea una película o serie de la lista compartida con estado *"Pendiente"* para decidir qué ver en pareja o en grupo sin discusiones.

---

### 1.3 Carga Rápida sin Fricción (APIs Públicas)
Para que agregar películas o series desde el móvil o PC no requiera buscar URLs de imágenes en Google:

1. **Buscador con Autocompletado:**
   - Integración con APIs gratuitas:
     - **TMDB API (The Movie Database):** Para películas y series.
     - **Jikan API / AniList API:** Para anime y manga.
2. **Autollenado inteligente:**
   - Al tipear el título, se despliega una lista de resultados.
   - Al seleccionar uno, se rellenan automáticamente:
     - Portada oficial en alta resolución.
     - Sinopsis oficial.
     - Año de estreno y número total de episodios/capítulos.
     - Géneros.

---

## 📈 FASES POSTERIORES (VISIÓN A FUTURO)

### 📊 FASE 2: Estadísticas de Pareja & Bitácora de Visionado
- **Métricas compartidas:** Total de horas vistas juntos vs. individuales, maratones completados.
- **Doble Puntuación:** Cada uno puede dejar su propia nota del 1 al 10 y un comentario breve por obra.

### 📱 FASE 3: Experiencia Móvil (PWA)
- Instalación de Nakama como app nativa en el móvil (iOS / Android) usando `vite-plugin-pwa`.
- Acceso directo desde la pantalla de inicio con diseño adaptado a gestos táctiles.

### 🎨 FASE 4: Multimedia Avanzada y Personalización
- Subida de imágenes locales mediante **Supabase Storage** (sin depender de enlaces externos).
- Temas visuales alternativos (Modo Noche Marítimo, Modo Pergamino, Modo Sunny).
