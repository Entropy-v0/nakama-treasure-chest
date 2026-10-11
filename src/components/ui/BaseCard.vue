<script setup lang="ts">
/**
 * BaseCard.vue — UI Primitive
 * Tarjeta contenedora estandarizada con tokens de diseño Nakama
 * para paneles, secciones de formulario y bloques de información.
 */
import { computed } from 'vue'

export type CardVariant = 'default' | 'elevated' | 'subtle' | 'surface'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardRounded = 'md' | 'lg' | 'xl' | '2xl'

interface Props {
  variant?: CardVariant
  padding?: CardPadding
  rounded?: CardRounded
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  rounded: 'xl',
  interactive: false,
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'elevated':
      return 'border border-[var(--border-color)] bg-bg-surface shadow-[var(--shadow-md)]'
    case 'subtle':
      return 'border border-white/5 bg-bg-elevated'
    case 'surface':
      return 'border border-white/10 bg-bg-surface'
    case 'default':
    default:
      return 'border border-white/10 bg-bg-card'
  }
})

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'sm':
      return 'p-3'
    case 'lg':
      return 'p-6 max-md:p-4'
    case 'md':
    default:
      return 'p-4'
  }
})

const roundedClasses = computed(() => {
  switch (props.rounded) {
    case 'md':
      return 'rounded-md'
    case 'lg':
      return 'rounded-lg'
    case '2xl':
      return 'rounded-2xl'
    case 'xl':
    default:
      return 'rounded-xl'
  }
})
</script>

<template>
  <div
    class="transition-all duration-200"
    :class="[
      variantClasses,
      paddingClasses,
      roundedClasses,
      interactive ? 'cursor-pointer hover:border-white/20 hover:shadow-md' : '',
    ]"
  >
    <div v-if="$slots.header" class="mb-3 border-b border-white/5 pb-3">
      <slot name="header" />
    </div>

    <slot />

    <div v-if="$slots.footer" class="mt-3 border-t border-white/5 pt-3">
      <slot name="footer" />
    </div>
  </div>
</template>

