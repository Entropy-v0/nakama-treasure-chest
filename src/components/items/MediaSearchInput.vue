<script setup lang="ts">
/**
 * MediaSearchInput.vue — Componente Dumb/Semi-dumb
 * Input de búsqueda de título con desplegable de autocompletado inteligente (AniList).
 */
import { ref } from 'vue'
import { Sparkles, Loader2 } from '@lucide/vue'
import FormInput from '../ui/FormInput.vue'
import type { MediaSearchResult } from '../../services/api/mediaSearch.service'

interface Props {
  modelValue: string
  results: MediaSearchResult[]
  isSearching: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select-suggestion': [item: MediaSearchResult]
  'search-input': [value: string]
}>()

const showDropdown = ref(false)

const handleInput = (val: string | number) => {
  const strVal = String(val)
  emit('update:modelValue', strVal)
  emit('search-input', strVal)
  showDropdown.value = true
}

const handleFocus = () => {
  if (props.results.length > 0) {
    showDropdown.value = true
  }
}

const handleSelect = (item: MediaSearchResult) => {
  showDropdown.value = false
  emit('select-suggestion', item)
}
</script>

<template>
  <div class="relative flex flex-col">
    <FormInput
      id="titulo"
      :model-value="modelValue"
      label="Título"
      placeholder="Escribe el título para autocompletar portada y datos..."
      :required="required"
      @update:model-value="handleInput"
      @focus="handleFocus"
    >
      <template #label-extra>
        <span class="flex items-center gap-1 text-[11px] font-medium text-green">
          <Sparkles :size="12" />
          <span>Autocompletado inteligente</span>
        </span>
      </template>

      <template v-if="isSearching" #trailing>
        <Loader2 :size="16" class="animate-spin text-green" />
      </template>
    </FormInput>

    <!-- Menú flotante de resultados -->
    <div
      v-if="showDropdown && results.length > 0"
      class="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-bg-surface p-1.5 shadow-2xl backdrop-blur-md"
    >
      <div
        v-for="res in results"
        :key="res.id"
        class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-bg-elevated"
        @click="handleSelect(res)"
      >
        <img
          v-if="res.portada"
          :src="res.portada"
          :alt="res.titulo"
          class="h-12 w-9 shrink-0 rounded border border-white/10 object-cover"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold text-text-primary">{{ res.titulo }}</p>
          <p class="mt-0.5 truncate text-[11px] text-text-muted">
            <span v-if="res.autor">{{ res.autor }} • </span>
            <span v-if="res.anio">{{ res.anio }} • </span>
            <span>{{ res.generos?.slice(0, 2).join(', ') || res.estudio || '' }}</span>
          </p>
        </div>
        <span class="shrink-0 rounded bg-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-green">
          Rellenar
        </span>
      </div>
    </div>
  </div>
</template>

