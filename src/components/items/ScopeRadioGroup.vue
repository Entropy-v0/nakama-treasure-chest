<script setup lang="ts">
/**
 * ScopeRadioGroup.vue — Componente Dumb
 * Selector de ámbito de publicación: Personal ("Solo para mí") vs Compartido ("Tripulación").
 */
import { User, Users } from '@lucide/vue'
import BaseCard from '../ui/BaseCard.vue'

interface Props {
  modelValue: 'personal' | 'tripulacion'
  hasCrew: boolean
  crewName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: 'personal' | 'tripulacion']
  'request-crew': []
}>()

const handleCrewClick = () => {
  if (!props.hasCrew) {
    emit('request-crew')
    return
  }
  emit('update:modelValue', 'tripulacion')
}
</script>

<template>
  <BaseCard variant="default" padding="md" rounded="xl">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
        Destino del contenido
      </span>
      <span v-if="hasCrew" class="flex items-center gap-1 text-[11px] font-semibold text-green">
        <Users :size="12" />
        <span>{{ crewName }}</span>
      </span>
    </div>

    <div class="mt-2 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
      <!-- Opción: Solo mío -->
      <button
        type="button"
        class="flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-left transition-all"
        :class="modelValue === 'personal'
          ? 'border-green bg-green/10 shadow-[0_0_12px_rgba(70,211,105,0.15)]'
          : 'border-white/5 bg-bg-surface hover:border-white/20'"
        @click="emit('update:modelValue', 'personal')"
      >
        <div class="flex items-center gap-1.5">
          <User :size="14" :class="modelValue === 'personal' ? 'text-green' : 'text-text-muted'" />
          <span class="text-xs font-bold text-white">Solo para mí</span>
        </div>
        <p class="text-[11px] leading-tight text-text-muted">
          Contenido personal. Solo tú podrás verlo en tu colección.
        </p>
      </button>

      <!-- Opción: Tripulación -->
      <button
        type="button"
        class="flex flex-col gap-1 rounded-xl border p-3 text-left transition-all"
        :class="[
          !hasCrew ? 'cursor-not-allowed border-white/5 bg-bg-surface opacity-50' : 'cursor-pointer',
          modelValue === 'tripulacion' && hasCrew
            ? 'border-green bg-green/10 shadow-[0_0_12px_rgba(70,211,105,0.15)]'
            : 'border-white/5 bg-bg-surface hover:border-white/20',
        ]"
        @click="handleCrewClick"
      >
        <div class="flex items-center gap-1.5">
          <Users :size="14" :class="modelValue === 'tripulacion' && hasCrew ? 'text-green' : 'text-text-muted'" />
          <span class="text-xs font-bold text-white">Compartir con Tripulación</span>
        </div>
        <p class="text-[11px] leading-tight text-text-muted">
          <span v-if="hasCrew">Aparece en el listado de todos los miembros para ver juntos.</span>
          <span v-else class="text-gold">Requiere unirse o crear una Tripulación primero.</span>
        </p>
      </button>
    </div>
  </BaseCard>
</template>

