<script setup lang="ts">
/**
 * ItemCard — Dumb Component
 * Tarjeta individual de la colección con portada, overlay hover, enlace directo, copiado y progreso.
 * Resuelve automáticamente sus colores y metadatos desde itemMeta si no se especifican.
 * Emite click para abrir modal de detalles.
 */
import { computed } from 'vue'
import { ExternalLink, Copy, Check, Users } from '@lucide/vue'
import type { Item } from '../../types/items'
import { TYPE_META, TYPE_CONFIG, STATUS_COLORS } from '../../constants/itemMeta'
import { useClipboard } from '../../composables/useClipboard'
import { isValidNumber } from '../../utils/number'

interface Props {
  item: Item
  typeMeta?: Record<string, any>
  statusColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  typeMeta: undefined,
  statusColor: undefined,
})

defineEmits<{
  select: [item: Item]
}>()

const { copied, copy } = useClipboard()

const typeConfig = computed(() => TYPE_CONFIG[props.item.tipo] || {
  label: props.item.tipo,
  color: '#FFFFFF',
  icon: null,
  hasProgress: false,
})

const resolvedTypeMeta = computed(() => {
  if (props.typeMeta && Object.keys(props.typeMeta).length > 0) {
    return props.typeMeta
  }
  return typeConfig.value
})

const resolvedStatusColor = computed(() => {
  return props.statusColor || STATUS_COLORS[props.item.estado] || 'var(--zoro-green)'
})
</script>

<template>
  <div
    class="group flex cursor-pointer flex-col gap-1.5"
    @click="$emit('select', item)"
  >
    <!-- Cover -->
    <div class="relative overflow-hidden rounded-xl border border-white/5 bg-bg-card transition-[border-color,box-shadow] duration-200 group-hover:border-[var(--zoro-green-border)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),var(--shadow-glow)]" style="aspect-ratio: 2/3;">
      <img
        v-if="item.portada"
        :src="item.portada"
        :alt="item.titulo"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center bg-bg-elevated">
        <component
          :is="resolvedTypeMeta.icon"
          v-if="resolvedTypeMeta.icon"
          :size="40"
          stroke-width="1.2"
          :style="{ color: resolvedTypeMeta.color }"
        />
      </div>

      <!-- Acceso directo al enlace en portada (si tiene link) -->
      <a
        v-if="item.link"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute top-2 left-2 z-10 flex size-6.5 items-center justify-center rounded-md bg-black/80 text-green-light shadow-sm backdrop-blur-sm transition-transform hover:scale-110 hover:bg-green hover:text-bg-base"
        title="Abrir enlace web"
        @click.stop
      >
        <ExternalLink :size="12" stroke-width="2.5" />
      </a>

      <!-- Progreso badge dinámico (Ep., Cap., Pág.) -->
      <div
        v-if="isValidNumber(item.progreso) && item.progreso > 0 && typeConfig.hasProgress"
        class="absolute top-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm"
      >
        {{ typeConfig.progressShortLabel || 'Prog.' }} {{ item.progreso }}
      </div>

      <!-- Hover overlay con acciones de link y puntuación -->
      <div class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 from-45% to-transparent p-3 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
        <p class="mb-1.5 line-clamp-2 text-xs font-semibold leading-tight text-white">
          {{ item.titulo }}
        </p>

        <!-- Botones de Enlace (Abrir / Copiar) dentro del hover -->
        <div v-if="item.link" class="mb-2 flex items-center gap-1.5" @click.stop>
          <a
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 rounded bg-green-dark/90 px-2 py-1 text-[10.5px] font-bold text-white transition-colors hover:bg-green-light hover:text-bg-base"
            title="Abrir enlace"
          >
            <ExternalLink :size="11" />
            Abrir
          </a>
          <button
            class="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10.5px] font-semibold text-text-primary transition-colors hover:bg-white/20"
            :title="copied ? '¡Copiado al portapapeles!' : 'Copiar enlace'"
            @click="copy(item.link)"
          >
            <component :is="copied ? Check : Copy" :size="11" :class="copied ? 'text-green' : ''" />
            {{ copied ? 'Listo' : 'Copiar' }}
          </button>
        </div>

        <div v-if="item.puntuacion" class="flex items-center gap-1 text-xs font-bold text-gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="var(--op-gold)" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {{ item.puntuacion }}/10
        </div>
      </div>
    </div>

    <!-- Status & Crew info -->
    <div class="flex items-center justify-between text-[11px] font-semibold">
      <div
        class="flex items-center gap-[5px]"
        :style="{ color: resolvedStatusColor }"
      >
        <span
          class="size-[7px] shrink-0 rounded-full"
          :style="{ background: resolvedStatusColor }"
        />
        {{ item.estado }}
      </div>
      <span
        v-if="item.crew_id"
        class="flex items-center gap-1 text-[10px] text-green font-bold"
        title="Compartido con tu tripulación"
      >
        <Users :size="10" />
        <span>Juntos</span>
      </span>
    </div>

    <!-- Type -->
    <div
      class="text-[10.5px] font-bold uppercase tracking-wider"
      :style="{ color: resolvedTypeMeta.color || '#FFFFFF' }"
    >
      {{ item.tipo }}
    </div>
  </div>
</template>
