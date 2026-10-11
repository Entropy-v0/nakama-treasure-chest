<script setup lang="ts">
/**
 * TypeSelector — Dumb Component
 * Selector en cuadrícula de tipos de contenido (Anime, Manga, etc.).
 */
import type { ItemTipo } from '../../types/items'
import { TIPOS, TYPE_META } from '../../constants/itemMeta'

interface Props {
  types?: (ItemTipo | string)[]
  typeMeta?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  types: () => TIPOS,
  typeMeta: () => TYPE_META,
})

const model = defineModel<ItemTipo | string>({ required: true })
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <button
      v-for="tipo in types"
      :key="tipo"
      type="button"
      class="flex cursor-pointer items-center justify-center gap-[7px] rounded-lg border border-[var(--border-color)] bg-bg-card px-3 py-2.5 font-body text-[13.5px] font-semibold text-text-muted transition-all duration-200 hover:text-text-primary"
      :class="{
        'border-[var(--t)] text-[var(--t)]': model === tipo,
      }"
      :style="model === tipo ? { '--t': typeMeta[tipo]?.color || '#FFFFFF', background: `color-mix(in srgb, ${typeMeta[tipo]?.color || '#FFFFFF'} 10%, transparent)` } : {}"
      @click="model = tipo"
    >
      <component
        v-if="typeMeta[tipo]?.icon"
        :is="typeMeta[tipo]?.icon"
        :size="16"
        stroke-width="2"
      />
      {{ tipo }}
    </button>
  </div>
</template>
