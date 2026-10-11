<script setup lang="ts">
/**
 * WeekdaySelector.vue — Componente Dumb
 * Selector de día de emisión semanal con pills interactivos.
 */
import type { DiaSemana } from '../../types/items'
import { DIAS_SEMANA } from '../../types/items'

interface Props {
  modelValue: DiaSemana | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: DiaSemana | null]
}>()

const toggleDay = (dia: DiaSemana) => {
  emit('update:modelValue', props.modelValue === dia ? null : dia)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">
      Día de emisión semanal <span class="text-xs font-normal text-text-muted">(para el Calendario)</span>
    </label>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="dia in DIAS_SEMANA"
        :key="dia"
        type="button"
        class="cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-all"
        :class="modelValue === dia
          ? 'border-green bg-green/10 font-bold text-green shadow-sm'
          : 'border-white/5 bg-bg-card text-text-muted hover:text-white'"
        @click="toggleDay(dia)"
      >
        {{ dia }}
      </button>
    </div>
  </div>
</template>

