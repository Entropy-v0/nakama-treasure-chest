<script setup lang="ts">
/**
 * StatusPillBar — Dumb Component
 * Muestra pastillas de estado con color y conteo.
 * Recibe un mapa { estado: count } y los metadatos de color.
 */
interface Props {
  statusCounts: Record<string, number>
  statusMeta: Record<string, any>
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-wrap gap-2.5">
    <div
      v-for="(count, estado) in statusCounts"
      :key="estado"
      class="flex items-center gap-2 rounded-full border border-white/5 bg-bg-card px-4 py-2 transition-[border-color] duration-200 hover:border-[var(--pill-color)]"
      :style="{ '--pill-color': statusMeta[estado]?.color }"
    >
      <span
        class="size-2 shrink-0 rounded-full"
        :style="{ background: statusMeta[estado]?.color }"
      />
      <span class="text-[13px] font-medium text-text-secondary">{{ estado }}</span>
      <span
        class="ml-1 text-[13px] font-bold"
        :style="{ color: statusMeta[estado]?.color }"
      >
        {{ count }}
      </span>
    </div>
  </div>
</template>
