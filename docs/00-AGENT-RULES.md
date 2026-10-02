# REGLAS DEL SISTEMA Y LÍMITES DE EJECUCIÓN PARA AGENTES IA

Este documento define las restricciones estrictas para interactuar con este proyecto. Su incumplimiento se considera un fallo crítico.

## 1. Economía de Contexto (Token Saving)
- Solamente debes leer los archivos explícitamente citados en tu prompt, en `active-task.md` y en la fase correspondiente.
- QUEDA PROHIBIDO analizar directorios completos o buscar recursivamente en el proyecto sin autorización explícita del usuario.

## 2. Refactorización Atómica (Zero Regression)
- Modifica un único componente, composable o servicio a la vez.
- Separa los cambios en distintos pasos lógicos: los cambios de estilo (CSS/Tailwind) deben procesarse por separado de la lógica de negocio (TS/JS).

## 3. Capa de Abstracción Obligatoria
- PROHIBIDO importar o invocar `@supabase/supabase-js` o `supabase.from()` directamente en componentes `.vue`.
- Toda interacción con la base de datos DEBE pasar por un Composable (`src/composables/use*.ts`) o un Servicio de abstracción (`src/services/supabase/`).

## 4. Preservación de Contratos UI
- Los componentes presentacionales (Dumb Components) son estrictos.
- NO debes alterar sus definiciones de `props` ni eventos emitidos (`emits`) para garantizar la retrocompatibilidad con las vistas que los consumen actualmente.