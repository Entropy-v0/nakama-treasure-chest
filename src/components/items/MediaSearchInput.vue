<script setup lang="ts">
/**
 * MediaSearchInput.vue — Componente Dumb/Semi-dumb
 * Input de búsqueda de título con desplegable de autocompletado inteligente (AniList).
 * Incluye auto-cierre por inactividad de mouse, desplazamiento en pantalla (scroll/touch),
 * clic fuera (click-outside) y tecla Escape.
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Sparkles, Loader2, X } from '@lucide/vue'
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

const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const showDropdown = ref(false)

let inactivityTimer: ReturnType<typeof setTimeout> | null = null
let isHovered = false

const clearTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
    inactivityTimer = null
  }
}

const startInactivityTimer = (delay = 3500) => {
  clearTimer()
  if (isHovered) return
  inactivityTimer = setTimeout(() => {
    closeDropdown()
  }, delay)
}

const openDropdown = () => {
  if (props.results.length > 0) {
    showDropdown.value = true
    startInactivityTimer(3500)
  }
}

const closeDropdown = () => {
  clearTimer()
  showDropdown.value = false
}

const handleInput = (val: string | number) => {
  const strVal = String(val)
  emit('update:modelValue', strVal)
  emit('search-input', strVal)
  showDropdown.value = true
  startInactivityTimer(3500)
}

const handleFocus = () => {
  openDropdown()
}

const handleSelect = (item: MediaSearchResult) => {
  closeDropdown()
  emit('select-suggestion', item)
}

const handleMouseEnter = () => {
  isHovered = true
  clearTimer()
}

const handleMouseLeave = () => {
  isHovered = false
  startInactivityTimer(1800)
}

// Watcher para abrir el dropdown automáticamente cuando lleguen resultados
watch(
  () => props.results,
  (newResults) => {
    if (newResults && newResults.length > 0) {
      showDropdown.value = true
      startInactivityTimer(3500)
    } else {
      closeDropdown()
    }
  }
)

// Listeners globales: Clic fuera, scroll, touchmove y tecla Escape
const onPointerDown = (event: PointerEvent) => {
  if (!showDropdown.value) return
  const target = event.target as Node | null
  if (containerRef.value && target && !containerRef.value.contains(target)) {
    closeDropdown()
  }
}

const onWindowScroll = (event: Event) => {
  if (!showDropdown.value) return
  // Si el scroll ocurre dentro del propio contenedor de sugerencias, no cerrar
  const target = event.target as Node | null
  if (dropdownRef.value && target && dropdownRef.value.contains(target)) {
    return
  }
  closeDropdown()
}

const onTouchMove = (event: TouchEvent) => {
  if (!showDropdown.value) return
  const target = event.target as Node | null
  if (dropdownRef.value && target && dropdownRef.value.contains(target)) {
    // Si interactúa dentro del dropdown en móvil, renovar temporizador
    startInactivityTimer(4000)
    return
  }
  // Si mueve la pantalla en el resto del formulario, cerrar de inmediato
  closeDropdown()
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showDropdown.value) {
    closeDropdown()
  }
}

onMounted(() => {
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('scroll', onWindowScroll, { passive: true, capture: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  clearTimer()
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('scroll', onWindowScroll, { capture: true })
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div ref="containerRef" class="relative flex flex-col">
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
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform opacity-0 -translate-y-1 scale-[0.99]"
      enter-to-class="transform opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform opacity-100 translate-y-0 scale-100"
      leave-to-class="transform opacity-0 -translate-y-1 scale-[0.99]"
    >
      <div
        v-if="showDropdown && results.length > 0"
        ref="dropdownRef"
        class="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-bg-surface shadow-2xl backdrop-blur-md"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- Cabecera de sugerencias con botón de descarte rápido -->
        <div class="flex items-center justify-between border-b border-white/5 bg-bg-elevated/40 px-3 py-1.5 text-[11px]">
          <span class="flex items-center gap-1 font-semibold text-green">
            <Sparkles :size="12" />
            <span>Sugerencias de AniList</span>
          </span>
          <button
            type="button"
            class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-text-muted transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            title="Descartar sugerencias (Esc)"
            @click="closeDropdown"
          >
            <X :size="12" />
            <span>Cerrar</span>
          </button>
        </div>

        <!-- Lista scrollable de resultados -->
        <div class="space-y-1 overflow-y-auto p-1.5">
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
    </Transition>
  </div>
</template>
