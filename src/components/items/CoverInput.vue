<script setup lang="ts">
/**
 * CoverInput.vue — Componente Dumb
 * Selector de portada para el contenido: subida de archivo local o enlace URL directo.
 */
import { Image as ImageIcon, Upload, X } from '@lucide/vue'
import BaseCard from '../ui/BaseCard.vue'

interface Props {
  url: string
  selectedFileName?: string | null
  hasFile?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:url': [value: string]
  'file-change': [event: Event]
  'clear-file': []
}>()

const handleUrlInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:url', target.value)
}
</script>

<template>
  <BaseCard variant="default" padding="sm" rounded="xl">
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">
        <ImageIcon :size="15" />
        Portada / Carátula
      </label>
      <span v-if="selectedFileName" class="max-w-[180px] truncate text-[11px] font-semibold text-green">
        {{ selectedFileName }}
      </span>
    </div>

    <!-- Selector de archivo local -->
    <div class="mt-2.5 flex items-center gap-2">
      <label
        class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-color)] bg-bg-input px-3 py-2.5 text-xs font-semibold text-text-secondary transition-all hover:border-green-light hover:text-green"
      >
        <Upload :size="15" />
        <span>{{ hasFile ? 'Cambiar archivo seleccionado' : 'Subir imagen desde tu equipo' }}</span>
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          class="hidden"
          @change="emit('file-change', $event)"
        />
      </label>
      <button
        v-if="hasFile"
        type="button"
        class="cursor-pointer rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-state-dropped transition-colors hover:bg-red-400/20"
        title="Quitar archivo seleccionado"
        @click="emit('clear-file')"
      >
        <X :size="15" />
      </button>
    </div>

    <!-- URL de imagen / autocompletada -->
    <div class="mt-2 flex flex-col gap-1 pt-0.5">
      <span class="text-[11px] text-text-muted">O enlace web directo:</span>
      <input
        id="portada"
        :value="url"
        type="url"
        class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-2 text-xs text-text-primary focus:border-green focus:outline-none"
        placeholder="https://imagen.jpg (o autocompletado)"
        @input="handleUrlInput"
      />
    </div>
  </BaseCard>
</template>

