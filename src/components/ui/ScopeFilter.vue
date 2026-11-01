<script setup lang="ts">
/**
 * ScopeFilter.vue — Dumb Component
 * Selector de ámbito de tripulación (Solo mío / Personal, Compartidos, Todos).
 * Reutilizable en Dashboard, Colección y Calendario.
 */
import { Layers, Users, User } from '@lucide/vue'
import type { ItemScope } from '../../types/items'

interface Props {
  personalLabel?: string
}

withDefaults(defineProps<Props>(), {
  personalLabel: 'Solo mío',
})

const model = defineModel<ItemScope>({ default: 'personal' })
</script>

<template>
  <div class="flex items-center gap-1 rounded-xl border border-white/5 bg-bg-surface p-1">
    <button
      type="button"
      class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-all duration-200"
      :class="model === 'personal' ? 'bg-green font-bold text-black shadow-sm' : 'text-text-muted hover:text-text-primary'"
      @click="model = 'personal'"
    >
      <User :size="13" />
      <span>{{ personalLabel }}</span>
    </button>

    <button
      type="button"
      class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-all duration-200"
      :class="model === 'compartido' ? 'bg-green font-bold text-black shadow-sm' : 'text-text-muted hover:text-text-primary'"
      @click="model = 'compartido'"
    >
      <Users :size="13" />
      <span>Compartidos</span>
    </button>

    <button
      type="button"
      class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-all duration-200"
      :class="model === 'todos' ? 'bg-green font-bold text-black shadow-sm' : 'text-text-muted hover:text-text-primary'"
      @click="model = 'todos'"
    >
      <Layers :size="13" />
      <span>Todos</span>
    </button>
  </div>
</template>
