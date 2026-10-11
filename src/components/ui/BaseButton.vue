<script setup lang="ts">
/**
 * BaseButton.vue — UI Primitive
 * Botón estandarizado de la aplicación con soporte para variantes semánticas,
 * tamaños, estado de carga (spinner animado) e íconos.
 */
import { computed } from 'vue'
import { Loader2 } from '@lucide/vue'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'discord' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  loadingText: '',
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-lg gap-1.5'
    case 'lg':
      return 'p-3.5 text-[15px] rounded-[10px] gap-2.5 font-bold'
    case 'md':
    default:
      return 'px-4 py-2.5 text-sm rounded-lg gap-2 font-semibold'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'border border-[var(--border-color)] bg-bg-elevated text-text-secondary hover:border-white/20 hover:text-text-primary hover:bg-bg-surface'
    case 'danger':
      return 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
    case 'ghost':
      return 'border border-transparent bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
    case 'discord':
      return 'border border-transparent bg-[#5865F2] text-white hover:bg-[#4752C4] hover:shadow-[0_0_24px_rgba(88,101,242,0.35)]'
    case 'outline':
      return 'border border-white/10 bg-bg-surface text-text-primary hover:border-white/20 hover:bg-bg-elevated hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]'
    case 'primary':
    default:
      return 'border border-green-light bg-green-dark text-white font-bold hover:bg-green-light hover:text-bg-base hover:shadow-[0_0_24px_rgba(61,122,85,0.14)]'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative inline-flex items-center justify-center font-body transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99] select-none"
    :class="[
      sizeClasses,
      variantClasses,
      block ? 'w-full' : '',
    ]"
    @click="handleClick"
  >
    <!-- Spinner de carga -->
    <Loader2
      v-if="loading"
      :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16"
      class="animate-spin shrink-0"
    />

    <!-- Ícono a la izquierda (si no está cargando) -->
    <slot v-if="!loading" name="icon-left" />

    <!-- Texto / Contenido principal -->
    <span>
      <template v-if="loading && loadingText">{{ loadingText }}</template>
      <slot v-else />
    </span>

    <!-- Ícono a la derecha (si no está cargando) -->
    <slot v-if="!loading" name="icon-right" />
  </button>
</template>
