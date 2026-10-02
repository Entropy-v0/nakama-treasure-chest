# FASE 1: UI Y ESTILOS CSS

**Objetivo:** Desacoplar la vista de la lógica y sanear el CSS sin modificar el comportamiento de los datos.

**Pasos de Ejecución:**
1. Identificar componentes "Dios" que mezclan peticiones y marcado HTML.
2. Extraer el HTML y CSS a nuevos "Dumb Components".
3. Mapear las variables que el componente necesita a `defineProps`.
4. Mapear las acciones del usuario a `defineEmits`.
5. Aplicar/Refactorizar clases de Tailwind evitando colisiones y eliminando `<style scoped>` innecesarios.

*Nota para el Agente: En esta fase, los datos siguen siendo Mocks. NO conectar Supabase.*