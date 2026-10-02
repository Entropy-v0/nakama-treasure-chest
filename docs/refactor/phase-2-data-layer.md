# FASE 2: CAPA DE DATOS Y CONTRATOS

**Objetivo:** Crear la infraestructura TypeScript y Composables para comunicarse con Supabase.

**Pasos de Ejecución:**
1. Crear el archivo de interfaces en `src/types/` mapeando la tabla de Supabase (considerando `nullables` y tipos correctos).
2. Crear el servicio de conexión en `src/services/supabase/` aislando el SDK.
3. Crear el Composable en `src/composables/` implementando el patrón de estado asíncrono (`data`, `isLoading`, `error`).
4. Añadir manejo básico de try/catch en el Composable.