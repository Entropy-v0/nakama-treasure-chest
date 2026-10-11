<script setup lang="ts">
/**
 * StatusFilter — Dumb Component
 * Filtro de estado con pills redondeadas y dots de color.
 */
import { ESTADOS_FILTER, STATUS_COLORS } from '../../constants/itemMeta'

interface Props {
  estados?: string[]
  active: string
  statusColors?: Record<string, string>
}

withDefaults(defineProps<Props>(), {
  estados: () => ESTADOS_FILTER,
  statusColors: () => STATUS_COLORS,
})

defineEmits<{
  select: [estado: string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="estado in estados"
      :key="estado"
      class="flex items-center gap-1.5 rounded-full border border-white/5 bg-transparent px-3 py-[5px] font-body text-[12.5px] font-medium text-text-muted cursor-pointer transition-all duration-200 hover:border-[var(--border-color)] hover:text-text-secondary"
      :class="{
        'border-[var(--s-color,var(--zoro-green))] text-[var(--s-color,var(--zoro-green))]': active === estado
      }"
      :style="[
        active === estado && estado !== 'Todos' ? { '--s-color': statusColors[estado], background: `color-mix(in srgb, ${statusColors[estado] || 'var(--zoro-green)'} 10%, transparent)` } : {},
      ]"
      @click="$emit('select', estado)"
    >
      <span
        v-if="estado !== 'Todos'"
        class="size-[7px] shrink-0 rounded-full"
        :style="{ background: statusColors[estado] }"
      />
      {{ estado }}
    </button>
  </div>
</template>
