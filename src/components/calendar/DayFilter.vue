<script setup lang="ts">
/**
 * DayFilter.vue — Dumb Component
 * Barra de pestañas / botones para filtrar por día de la semana.
 * Encapsula estilos activos/inactivos, badge de 'Hoy' y conteo por día.
 */
interface Props {
  days: string[]
  activeDay: string
  currentDay: string
  counts?: Record<string, number>
  labels?: Record<string, string>
}

withDefaults(defineProps<Props>(), {
  counts: () => ({}),
  labels: () => ({}),
})

defineEmits<{
  select: [day: string]
}>()
</script>

<template>
  <nav class="mb-6 flex flex-wrap items-center gap-2 border-b border-white/5 pb-4" aria-label="Filtro de días de emisión">
    <button
      v-for="dia in days"
      :key="dia"
      type="button"
      class="flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200"
      :class="[
        activeDay === dia
          ? 'border-[var(--zoro-green)] bg-[var(--zoro-green)]/10 text-white shadow-[0_0_12px_rgba(40,167,69,0.2)]'
          : 'border-[var(--border-color)] bg-bg-card text-text-secondary hover:border-[var(--zoro-green-border)] hover:text-white'
      ]"
      @click="$emit('select', dia)"
    >
      <span>{{ labels[dia] || dia }}</span>

      <!-- Badge de "Hoy" -->
      <span
        v-if="dia === currentDay"
        class="rounded-full bg-green/20 px-1.5 py-0.5 text-[10px] text-green"
      >
        Hoy
      </span>

      <!-- Badge de Conteo -->
      <span
        class="rounded-md px-1.5 py-0.5 text-[10px]"
        :class="activeDay === dia ? 'bg-green text-bg-dark font-bold' : 'bg-white/5 text-text-muted'"
      >
        {{ counts[dia] || 0 }}
      </span>
    </button>
  </nav>
</template>
