<script setup lang="ts">
/**
 * EmptyState — Dumb Component (reutilizable en toda la app)
 * Muestra un estado vacío con ícono, mensaje y CTA opcional.
 */
import { Anchor } from '@lucide/vue'

interface Props {
  message?: string
  actionLabel?: string | null
}

withDefaults(defineProps<Props>(), {
  message: 'No hay contenido aún.',
  actionLabel: null,
})

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-16 text-center">
    <Anchor class="text-white" :size="56" stroke-width="1" />
    <p class="text-base text-text-secondary">{{ message }}</p>
    <button
      v-if="actionLabel"
      class="cursor-pointer rounded-lg border border-green-light bg-green-dark px-7 py-3 font-body text-sm font-semibold text-white transition-all duration-200 hover:bg-green-light hover:text-bg-base"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
