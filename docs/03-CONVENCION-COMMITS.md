# Convención de Commits - Rama `refactor/limpieza-base`

Este documento establece el estándar formal para estructurar los mensajes de commit generados por el agente IA y los desarrolladores durante el ciclo de refactorización en la rama `refactor/limpieza-base`.

---

## 1. Estructura Obligatoria del Mensaje

Todo commit debe adherirse a la siguiente plantilla:

```text
refactor(limpieza-base/<fase>): <título descriptivo en presente>

<Párrafo breve explicando el objetivo, contexto y problema resuelto>

Archivos modificados:
- <ruta/archivo.ext>: <descripción concisa del cambio>
- <ruta/archivo.ext>: <descripción concisa del cambio>
```

---

## 2. Parámetros y Componentes

| Sección | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **Cabecera (Header)** | `refactor(limpieza-base/<fase>): <título>` | `refactor(limpieza-base/fase-0): desbloqueo de compilacion y mocks locales` |
| **Fase** | El identificador de la fase del plan (`fase-0`, `fase-1`, etc.) | `fase-0`, `fase-1`, `fase-2` |
| **Título** | Máximo 72 caracteres, en minúsculas, claro y conciso. | `desbloquear rolldown y sincronizar mock user` |
| **Cuerpo (Body)** | Explica el *por qué* y el impacto del cambio. | `Restaura Calendar.vue para evitar fallo en build y unifica el ID mock entre auth y crew.` |
| **Detalle de Archivos** | Lista viñetada con la ruta relativa exacta y qué hace cada archivo. | Ver ejemplo abajo. |

---

## 3. Ejemplo Canónico (Fase 0)

```text
refactor(limpieza-base/fase-0): desbloqueo de compilacion y mocks locales coherentes

Restaura el componente Calendar para solventar el bloqueo del bundler en produccion,
unifica la fuente de verdad del usuario simulado y sincroniza los permisos de tripulacion.

Archivos modificados:
- src/components/Calendar.vue: Restaurar estructura minima SFC y template tematico reactivo
- src/router/index.ts: Configurar ruta canonica /calendar y redireccion
- src/components/Sidebar.vue: Anadir enlace al calendario con icono tematico
- src/mocks/mockUser.ts: Crear modulo central de usuario mock (MOCK_USER_ID y email)
- src/services/supabase/auth.service.ts: Sincronizar ID de sesion local con mockUser
- src/services/supabase/crew.service.ts: Alinear created_by con mockUser y filtrar invitaciones
- docs/refactor/*: Planes detallados de fases 0 a 6 y criterios de aceptacion
- docs/reportes/2026-10-04-auditoria-arquitectura.md: Informe de auditoria tecnica
```

---

## 4. Reglas Estrictas para Agentes IA

1. **Un commit por fase completada:** No mezclar cambios de fases distintas en un solo commit.
2. **Verificación previa obligatoria:** Ningún commit debe crearse si `pnpm run build` falla.
3. **Sin credenciales:** Jamás incluir archivos `.env`, credenciales ni secretos en el `git add`.
