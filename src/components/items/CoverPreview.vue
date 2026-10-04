<script setup lang="ts">
/**
 * CoverPreview — Dumb Component
 * Previsualización de portada de un ítem con fallback a icono por tipo.
 */
interface Props {
  url?: string | null
  typeMeta?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  url: '',
  typeMeta: () => ({}),
})
</script>

<template>
  <div class="w-full max-md:mx-auto max-md:w-40">
    <div
      v-if="url"
      class="max-h-70 w-full overflow-hidden rounded-xl border border-[var(--border-color)]"
      style="aspect-ratio: 2/3;"
    >
      <img
        :src="url"
        alt="Preview de portada"
        class="h-full w-full object-cover"
      />
    </div>

    <div
      v-else
      class="flex max-h-70 w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-[var(--border-color)] bg-bg-card"
      style="aspect-ratio: 2/3;"
    >
      <component
        v-if="typeMeta.icon"
        :is="typeMeta.icon"
        :size="40"
        stroke-width="1.2"
        :style="{ color: typeMeta.color || '#FFFFFF' }"
      />
      <span class="text-[13px] text-text-muted">Sin portada</span>
    </div>
  </div>
</template>
