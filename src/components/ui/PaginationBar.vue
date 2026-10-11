<script setup lang="ts">
/**
 * PaginationBar — Dumb Component
 * Controles de paginación numérica (anterior, indicador de página, siguiente).
 * Compatible con v-model:current-page.
 */
interface Props {
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  change: [page: number]
}>()

const setPage = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('update:currentPage', page)
  emit('change', page)
}
</script>

<template>
  <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-5 border-t border-white/5 pt-6">
    <button
      type="button"
      class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-card font-body text-lg text-text-primary transition-all duration-200 hover:border-[var(--zoro-green-border)] hover:text-green disabled:cursor-not-allowed disabled:opacity-30"
      :disabled="currentPage <= 1"
      title="Página anterior"
      @click="setPage(currentPage - 1)"
    >
      ‹
    </button>

    <span class="text-sm font-semibold text-text-muted">
      {{ currentPage }} / {{ totalPages }}
    </span>

    <button
      type="button"
      class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-card font-body text-lg text-text-primary transition-all duration-200 hover:border-[var(--zoro-green-border)] hover:text-green disabled:cursor-not-allowed disabled:opacity-30"
      :disabled="currentPage >= totalPages"
      title="Página siguiente"
      @click="setPage(currentPage + 1)"
    >
      ›
    </button>
  </div>
</template>

