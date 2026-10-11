<script setup lang="ts">
/**
 * RecentItemCard — Dumb Component
 * Tarjeta individual de un ítem reciente con portada, link badge, progreso y tipo.
 */
import { computed } from 'vue'
import { ExternalLink, Copy, Check, Users } from '@lucide/vue'
import type { Item } from '../../types/items'
import { TYPE_CONFIG } from '../../constants/itemMeta'
import { useClipboard } from '../../composables/useClipboard'
import { isValidNumber } from '../../utils/number'

interface Props {
  item: Item
  typeMeta?: Record<string, any>
  statusMeta?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  typeMeta: () => ({}),
  statusMeta: () => ({}),
})

const { copied, copy } = useClipboard()

const typeConfig = computed(() => TYPE_CONFIG[props.item.tipo] || {
  label: props.item.tipo,
  color: '#FFFFFF',
  icon: null,
  hasProgress: false,
})
</script>

<template>
  <div class="flex cursor-pointer flex-col gap-1.5">
    <!-- Cover -->
    <div class="relative overflow-hidden rounded-[10px] border border-white/5 bg-bg-card" style="aspect-ratio: 2/3;">
      <img
        v-if="item.portada"
        :src="item.portada"
        :alt="item.titulo"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-105"
      />
      <div v-else class="flex h-full w-full items-center justify-center bg-bg-elevated">
        <component
          :is="typeMeta.icon"
          v-if="typeMeta.icon"
          :size="32"
          stroke-width="1.2"
          :style="{ color: typeMeta.color }"
        />
      </div>

      <!-- Acciones de enlace web (Abrir / Copiar) -->
      <div
        v-if="item.link"
        class="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded bg-black/80 p-0.5 shadow-sm backdrop-blur-sm"
        @click.stop
      >
        <a
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="flex size-5 items-center justify-center rounded text-green-light transition-colors hover:bg-green hover:text-bg-base"
          title="Abrir enlace web"
        >
          <ExternalLink :size="11" stroke-width="2.5" />
        </a>
        <button
          type="button"
          class="flex size-5 cursor-pointer items-center justify-center rounded text-text-secondary transition-colors hover:bg-white/20 hover:text-white"
          :title="copied ? '¡Copiado!' : 'Copiar enlace'"
          @click.stop="copy(item.link)"
        >
          <Check v-if="copied" :size="11" class="text-green" stroke-width="2.5" />
          <Copy v-else :size="11" stroke-width="2" />
        </button>
      </div>

      <!-- Status badge -->
      <div
        class="absolute bottom-1.5 left-1.5 rounded-full px-[7px] py-0.5 text-[9px] font-bold uppercase tracking-wide text-black opacity-90"
        :style="{ background: statusMeta.color }"
      >
        {{ item.estado }}
      </div>

      <!-- Crew shared badge -->
      <div
        v-if="item.crew_id"
        class="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-green shadow-sm backdrop-blur-sm"
        title="Compartido con tu tripulación"
      >
        <Users :size="10" />
        <span>Juntos</span>
      </div>

      <!-- Progress badge dinámico -->
      <div
        v-if="isValidNumber(item.progreso) && item.progreso > 0 && typeConfig.hasProgress"
        class="absolute top-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm"
      >
        {{ typeConfig.progressShortLabel || 'Prog.' }} {{ item.progreso }}
      </div>
    </div>

    <!-- Title -->
    <p class="line-clamp-2 text-xs font-semibold leading-tight text-text-primary">
      {{ item.titulo }}
    </p>

    <!-- Type -->
    <span
      class="text-[11px] font-semibold uppercase tracking-wider"
      :style="{ color: typeMeta.color }"
    >
      {{ item.tipo }}
    </span>
  </div>
</template>
