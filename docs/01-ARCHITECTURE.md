# ARQUITECTURA FRONTEND: VUE 3 + SUPABASE

## Patrón de Componentes (Smart vs Dumb)
- **Dumb Components (`/src/components/ui/`)**: Son agnósticos. Reciben datos por `props` y notifican acciones por `emits`. No manejan estado asíncrono y no conocen Supabase.
- **Smart Components (`/src/views/` o `/src/components/containers/`)**: Componentes orquestadores. Importan los Composables, manejan el estado asíncrono (loading, error) y pasan la información a los Dumb Components.

## Capa de Datos (Supabase Data Layer)
El flujo de información debe seguir esta cadena estricta:
1. **Componente Vue (Smart)** llama a un Composable.
2. **Composable (`use[Entidad].ts`)** maneja reactividad (`ref`), `isLoading`, y `error`.
3. **Servicio (`supabase.ts`)** ejecuta la consulta real al SDK de Supabase.
4. **Contrato (`types/*.ts`)** tipa estrictamente las entradas y salidas de Supabase.