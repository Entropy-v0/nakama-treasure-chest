<script setup lang="ts">
/**
 * ItemDetailsModal.vue — Dumb/Presentational Component con Acciones Rápidas
 * Responsabilidad única: Visualizar los detalles de un ítem, gestionar su progreso (+1/-1),
 * copiar/abrir enlaces y permitir navegar a edición completa o eliminar.
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Trash2,
  StickyNote,
  Pencil,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
} from '@lucide/vue'
import { useItemsStore } from '../../stores/items'
import { useAlert } from '../../composables/useAlert'
import { useClipboard } from '../../composables/useClipboard'
import type { Item } from '../../types/items'
import { TYPE_META, TYPE_CONFIG, STATUS_META } from '../../constants/itemMeta'
import { isValidNumber } from '../../utils/number'
import BaseButton from '../ui/BaseButton.vue'

interface Props {
  item: Item
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const itemsStore = useItemsStore()
const { deleteItem, advanceProgress } = itemsStore
const { showConfirm } = useAlert()
const { copied, copy } = useClipboard()

const typeConfig = computed(() => TYPE_CONFIG[props.item.tipo] || {
  label: props.item.tipo,
  color: 'var(--text-muted)',
  icon: null,
  hasProgress: false,
})

const typeMeta = computed(() => TYPE_META[props.item.tipo] || { color: 'var(--text-muted)', label: props.item.tipo })
const statusMeta = computed(() => STATUS_META[props.item.estado] || { color: 'var(--text-muted)', bg: 'transparent' })

const progresoLabel = computed(() => {
  return typeConfig.value.progressLabel?.replace(' actual', '') || 'Progreso'
})

const handleEdit = () => {
  emit('close')
  router.push(`/edit/${props.item.id}`)
}

const incrementProgress = () => advanceProgress(props.item.id, 1)
const decrementProgress = () => advanceProgress(props.item.id, -1)

const handleDelete = async () => {
  const confirmed = await showConfirm({
    type: 'warning',
    title: 'Eliminar de la colección',
    message: `¿Deseas eliminar "${props.item.titulo}" permanentemente?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  })
  if (confirmed) {
    await deleteItem(props.item.id)
    emit('close')
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-md max-md:p-4"
    @click.self="$emit('close')"
  >
    <div class="relative w-[90%] max-w-[700px] overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-bg-surface shadow-[0_20px_48px_rgba(0,0,0,0.7),var(--shadow-glow)] max-md:max-h-[95vh] max-md:w-full max-md:overflow-y-auto">

      <!-- Top accent line -->
      <div
        class="absolute top-0 right-0 left-0 h-[3px]"
        :style="{ background: typeMeta.color }"
      />

      <!-- Close button -->
      <button
        class="absolute top-4 right-4 z-10 flex size-[34px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-elevated text-text-secondary transition-colors duration-200 hover:border-state-dropped hover:text-state-dropped"
        title="Cerrar"
        @click="$emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div class="flex gap-7 p-8 max-md:flex-col max-md:gap-5 max-md:p-5">

        <!-- ── Columna Izquierda: Portada y Acciones ── -->
        <div class="flex w-[200px] shrink-0 flex-col gap-3 max-md:w-full max-md:items-center">
          <div
            class="relative w-full overflow-hidden rounded-xl border border-[var(--border-color)] bg-bg-card max-md:w-[140px]"
            style="aspect-ratio: 2/3;"
          >
            <img
              v-if="item.portada"
              :src="item.portada"
              :alt="item.titulo"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-bg-elevated">
              <component
                :is="typeMeta.icon"
                v-if="typeMeta.icon"
                :size="48"
                stroke-width="1.2"
                :style="{ color: typeMeta.color }"
              />
            </div>
          </div>

          <!-- Tipo badge -->
          <div
            class="flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.8px]"
            :style="{
              color: typeMeta.color,
              background: `color-mix(in srgb, ${typeMeta.color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${typeMeta.color} 28%, transparent)`,
            }"
          >
            <component :is="typeMeta.icon" :size="13" stroke-width="2" />
            {{ typeMeta.label }}
          </div>

          <!-- Puntuación -->
          <div v-if="item.puntuacion" class="flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--op-gold)" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span class="font-heading text-[28px] font-bold leading-none text-gold">{{ item.puntuacion }}</span>
            <span class="text-sm text-text-muted">/10</span>
          </div>

          <!-- Acciones principales -->
          <div class="mt-2 flex w-full flex-col gap-2 max-md:max-w-[200px]">
            <BaseButton
              variant="secondary"
              size="md"
              block
              @click="handleEdit"
            >
              <template #icon-left>
                <Pencil :size="15" stroke-width="2" />
              </template>
              Editar información
            </BaseButton>
            <BaseButton
              variant="danger"
              size="md"
              block
              @click="handleDelete"
            >
              <template #icon-left>
                <Trash2 :size="15" stroke-width="2" />
              </template>
              Eliminar
            </BaseButton>
          </div>
        </div>

        <!-- ── Columna Derecha: Información y Metadatos ── -->
        <div class="flex min-w-0 flex-1 flex-col gap-4 pt-1">
          <!-- Estado pill y Link externo -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div
              class="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.8px]"
              :style="{ color: statusMeta.color, background: statusMeta.bg, border: `1px solid ${statusMeta.color}` }"
            >
              <span class="size-[7px] shrink-0 rounded-full" :style="{ background: statusMeta.color }" />
              {{ item.estado }}
            </div>

            <!-- Enlace web si existe (Abrir y Copiar) -->
            <div v-if="item.link" class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-text-secondary transition-all hover:border-green-light hover:text-green"
                :title="copied ? '¡Copiado!' : 'Copiar enlace'"
                @click="copy(item.link)"
              >
                <Check v-if="copied" :size="13" class="text-green" stroke-width="2.5" />
                <Copy v-else :size="13" stroke-width="2" />
                <span>{{ copied ? '¡Copiado!' : 'Copiar enlace' }}</span>
              </button>
              <a
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-lg border border-green-light/30 bg-green-dark/25 px-3 py-1 text-xs font-semibold text-green-light transition-all hover:border-green-light hover:bg-green-light hover:text-bg-base"
              >
                <ExternalLink :size="13" stroke-width="2" />
                Abrir enlace
              </a>
            </div>
          </div>

          <!-- Título -->
          <h2 class="font-heading text-[1.6rem] font-bold leading-tight break-words text-text-primary">
            {{ item.titulo }}
          </h2>

          <!-- Progreso / Capítulo o Episodio (dinámico según typeConfig, con botones +/- rápidos) -->
          <div
            v-if="typeConfig.hasProgress"
            class="flex items-center justify-between rounded-xl border border-white/5 bg-bg-card p-3"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-elevated text-green">
                <Bookmark :size="17" stroke-width="2" />
              </div>
              <div class="flex flex-col leading-tight">
                <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">{{ progresoLabel }} actual</span>
                <span class="font-heading text-lg font-bold text-text-primary">
                  <template v-if="isValidNumber(item.progreso)">
                    {{ progresoLabel }} {{ item.progreso }}
                  </template>
                  <template v-else>
                    <span class="text-sm font-normal text-text-muted">Sin registrar</span>
                  </template>
                </span>
              </div>
            </div>

            <!-- Controles rápidos de +/- -->
            <div class="flex items-center gap-1.5">
              <button
                class="flex size-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border-color)] bg-bg-elevated text-sm font-bold text-text-secondary transition-colors hover:border-green-light hover:text-green disabled:cursor-not-allowed disabled:opacity-30"
                :disabled="!isValidNumber(item.progreso) || item.progreso <= 0"
                title="Disminuir -1"
                @click="decrementProgress"
              >
                -
              </button>
              <button
                class="flex size-7 cursor-pointer items-center justify-center rounded-md border border-green-light/40 bg-green-dark/30 text-sm font-bold text-green transition-all hover:bg-green-light hover:text-bg-base"
                title="Aumentar +1"
                @click="incrementProgress"
              >
                +1
              </button>
            </div>
          </div>

          <!-- Meta info -->
          <div class="grid grid-cols-2 gap-3">
            <div v-if="isValidNumber(item.anio)" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">Año</span>
              <span class="text-sm font-medium text-text-primary">{{ item.anio }}</span>
            </div>
            <div v-if="item.autor" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">{{ typeConfig.creatorLabel || 'Autor' }}</span>
              <span class="text-sm font-medium text-text-primary">{{ item.autor }}</span>
            </div>
            <div v-if="item.estudio" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">{{ typeConfig.publisherLabel || 'Estudio' }}</span>
              <span class="text-sm font-medium text-text-primary">{{ item.estudio }}</span>
            </div>
            <div v-if="item.dia_semana && typeConfig.hasBroadcastDay" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">Emisión</span>
              <span class="text-sm font-medium capitalize text-text-primary">{{ item.dia_semana }}</span>
            </div>
          </div>

          <!-- Géneros -->
          <div v-if="item.generos && item.generos.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="g in item.generos"
              :key="g"
              class="rounded-full border border-[var(--border-color)] bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary"
            >
              {{ g }}
            </span>
          </div>

          <!-- Descripción -->
          <div v-if="item.nota" class="flex flex-1 flex-col rounded-xl border border-white/5 bg-bg-card p-3.5">
            <div class="mb-2 flex items-center justify-between text-text-muted">
              <div class="flex items-center gap-1.5">
                <StickyNote :size="14" stroke-width="2" />
                <span class="text-[11px] font-bold uppercase tracking-wider">Descripción</span>
              </div>
              <button
                class="cursor-pointer text-xs text-text-muted hover:text-green"
                title="Editar descripción"
                @click="handleEdit"
              >
                <Pencil :size="12" />
              </button>
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-line text-text-secondary">{{ item.nota }}</p>
          </div>
          <div v-else class="flex flex-1 flex-col rounded-xl border border-white/5 bg-bg-card p-3.5">
            <div class="flex items-center justify-between text-text-muted">
              <div class="flex items-center gap-1.5">
                <StickyNote :size="14" stroke-width="2" />
                <span class="text-[11px] font-bold uppercase tracking-wider">Sin descripción</span>
              </div>
              <button
                class="cursor-pointer text-xs text-green hover:underline"
                @click="handleEdit"
              >
                + Agregar descripción
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

