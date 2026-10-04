<script setup>
/**
 * ItemDetailsModal.vue — Refactorizado con Modo Edición y Progreso
 * Permite visualizar y editar la información de la tarjeta (estado, puntuación, progreso/capítulo, nota, link, etc.),
 * así como botones de avance rápido (+1 / -1) y eliminación.
 */
import { ref, computed } from 'vue'
import {
  Trash2,
  StickyNote,
  Pencil,
  ExternalLink,
  Copy,
  Check,
  X,
  Globe,
  Bookmark,
} from '@lucide/vue'
import { useItems } from '../composables/useItems'
import { useAlert } from '../composables/useAlert'
import {
  TYPE_META,
  STATUS_META,
  STATUS_COLORS,
  ESTADOS,
} from '../composables/useTypeMeta'
import StatusSelector from './items/StatusSelector.vue'
import ScoreSelector from './items/ScoreSelector.vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['close'])
const { updateItem, deleteItem } = useItems()
const { showAlert, showConfirm } = useAlert()

const copied = ref(false)
const copyLink = async (url) => {
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}

const isEditing = ref(false)
const editForm = ref({
  titulo: '',
  estado: 'Pendiente',
  puntuacion: null,
  progreso: null,
  link: '',
  nota: '',
  anio: '',
  autor: '',
  estudio: '',
  portada: '',
})

const typeMeta = computed(() => TYPE_META[props.item.tipo] || { color: 'var(--text-muted)', label: props.item.tipo })
const statusMeta = computed(() => STATUS_META[props.item.estado] || { color: 'var(--text-muted)', bg: 'transparent' })

const progresoLabel = computed(() => {
  if (props.item.tipo === 'Manga') return 'Capítulo'
  if (props.item.tipo === 'Anime' || props.item.tipo === 'Serie') return 'Episodio'
  return 'Progreso'
})

const startEditing = () => {
  editForm.value = {
    titulo: props.item.titulo || '',
    estado: props.item.estado || 'Pendiente',
    puntuacion: props.item.puntuacion ?? null,
    progreso: props.item.progreso ?? '',
    link: props.item.link || '',
    nota: props.item.nota || '',
    anio: props.item.anio ?? '',
    autor: props.item.autor || '',
    estudio: props.item.estudio || '',
    portada: props.item.portada || '',
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const incrementProgress = async () => {
  const current = typeof props.item.progreso === 'number' ? props.item.progreso : 0
  const next = current + 1
  try {
    await updateItem(props.item.id, { progreso: next })
  } catch (err) {
    console.error('Error al incrementar progreso:', err)
  }
}

const decrementProgress = async () => {
  const current = typeof props.item.progreso === 'number' ? props.item.progreso : 0
  if (current <= 0) return
  const next = current - 1
  try {
    await updateItem(props.item.id, { progreso: next })
  } catch (err) {
    console.error('Error al disminuir progreso:', err)
  }
}

const handleSave = async () => {
  if (!editForm.value.titulo.trim()) {
    await showAlert({
      type: 'info',
      title: 'Campo requerido',
      message: 'El título no puede estar vacío.',
    })
    return
  }

  const updates = {
    ...editForm.value,
    link: editForm.value.link?.trim() || null,
    progreso: editForm.value.progreso !== null && editForm.value.progreso !== '' ? parseInt(editForm.value.progreso) : null,
    anio: editForm.value.anio ? parseInt(editForm.value.anio) : null,
  }

  try {
    await updateItem(props.item.id, updates)
    isEditing.value = false
    await showAlert({
      type: 'success',
      title: '¡Actualizado!',
      message: `La información de "${editForm.value.titulo}" fue actualizada.`,
    })
  } catch (err) {
    await showAlert({
      type: 'error',
      title: 'Error',
      message: 'No se pudo guardar la información.',
    })
  }
}

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

          <!-- Puntuación (Modo Lectura) -->
          <div v-if="!isEditing && item.puntuacion" class="flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--op-gold)" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span class="font-heading text-[28px] font-bold leading-none text-gold">{{ item.puntuacion }}</span>
            <span class="text-sm text-text-muted">/10</span>
          </div>

          <!-- Acciones principales -->
          <div class="mt-2 flex w-full flex-col gap-2 max-md:max-w-[200px]">
            <template v-if="!isEditing">
              <button
                class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-bg-elevated p-2.5 font-body text-[13px] font-semibold text-text-primary transition-all duration-200 hover:border-green-light hover:text-green"
                @click="startEditing"
              >
                <Pencil :size="15" stroke-width="2" />
                Editar información
              </button>
              <button
                class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-400/25 bg-red-400/10 p-2.5 font-body text-[13px] font-semibold text-state-dropped transition-colors duration-200 hover:border-state-dropped hover:bg-red-400/20"
                @click="handleDelete"
              >
                <Trash2 :size="15" stroke-width="2" />
                Eliminar
              </button>
            </template>

            <template v-else>
              <button
                class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-green-light bg-green-dark p-2.5 font-body text-[13px] font-bold text-white transition-all duration-200 hover:bg-green-light hover:text-bg-base hover:shadow-[0_0_24px_rgba(61,122,85,0.2)]"
                @click="handleSave"
              >
                <Check :size="16" stroke-width="2.5" />
                Guardar cambios
              </button>
              <button
                class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-bg-elevated p-2 font-body text-[13px] font-semibold text-text-secondary transition-colors duration-200 hover:text-text-primary"
                @click="cancelEditing"
              >
                <X :size="15" stroke-width="2" />
                Cancelar
              </button>
            </template>
          </div>
        </div>

        <!-- ── Columna Derecha: Información / Formulario de Edición ── -->
        <div class="flex min-w-0 flex-1 flex-col gap-4 pt-1">

          <!-- ══════ MODO LECTURA ══════ -->
          <template v-if="!isEditing">
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
                  @click="copyLink(item.link)"
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

            <!-- Progreso / Capítulo o Episodio (oculto para Películas, con botones +/- rápidos) -->
            <div
              v-if="item.tipo !== 'Película'"
              class="flex items-center justify-between rounded-xl border border-white/5 bg-bg-card p-3"
            >
              <div class="flex items-center gap-3">
                <div class="flex size-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-elevated text-green">
                  <Bookmark :size="17" stroke-width="2" />
                </div>
                <div class="flex flex-col leading-tight">
                  <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">{{ progresoLabel }} actual</span>
                  <span class="font-heading text-lg font-bold text-text-primary">
                    <template v-if="item.progreso !== null && item.progreso !== undefined && item.progreso !== ''">
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
                  :disabled="!item.progreso || item.progreso <= 0"
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
              <div v-if="item.anio" class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">Año</span>
                <span class="text-sm font-medium text-text-primary">{{ item.anio }}</span>
              </div>
              <div v-if="item.autor" class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">Autor</span>
                <span class="text-sm font-medium text-text-primary">{{ item.autor }}</span>
              </div>
              <div v-if="item.estudio" class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">Estudio</span>
                <span class="text-sm font-medium text-text-primary">{{ item.estudio }}</span>
              </div>
              <div v-if="item.categoria" class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">Categoría</span>
                <span class="text-sm font-medium text-text-primary">{{ item.categoria }}</span>
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
                  @click="startEditing"
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
                  @click="startEditing"
                >
                  + Agregar descripción
                </button>
              </div>
            </div>
          </template>

          <!-- ══════ MODO EDICIÓN ══════ -->
          <template v-else>
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between border-b border-white/5 pb-2">
                <span class="font-heading text-sm font-bold uppercase tracking-wider text-green">Editando tarjeta</span>
              </div>

              <!-- Título -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Título</label>
                <input
                  v-model="editForm.titulo"
                  type="text"
                  class="rounded-lg border border-[var(--border-color)] bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-green-light focus:outline-none"
                  placeholder="Título..."
                />
              </div>

              <!-- Estado -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Estado</label>
                <StatusSelector
                  v-model="editForm.estado"
                  :statuses="ESTADOS"
                  :status-colors="STATUS_COLORS"
                />
              </div>

              <!-- Progreso / Capítulo o Episodio (oculto para Películas) -->
              <div v-if="item.tipo !== 'Película'" class="flex flex-col gap-1.5">
                <label class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <Bookmark :size="13" />
                  {{ progresoLabel }} actual (número)
                </label>
                <input
                  v-model="editForm.progreso"
                  type="number"
                  min="0"
                  class="rounded-lg border border-[var(--border-color)] bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-green-light focus:outline-none"
                  placeholder="ej: 1045"
                />
              </div>

              <!-- Puntuación -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Puntuación (1-10)</label>
                <ScoreSelector v-model="editForm.puntuacion" />
              </div>

              <!-- Enlace web / Link -->
              <div class="flex flex-col gap-1.5">
                <label class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <Globe :size="13" />
                  Enlace web (para ver o leer)
                </label>
                <input
                  v-model="editForm.link"
                  type="url"
                  class="rounded-lg border border-[var(--border-color)] bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-green-light focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <!-- Metadatos secundarios (Año, Autor/Estudio) -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Año</label>
                  <input
                    v-model="editForm.anio"
                    type="number"
                    class="rounded-lg border border-[var(--border-color)] bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-green-light focus:outline-none"
                    placeholder="ej: 2024"
                  />
                </div>
                <div v-if="item.tipo === 'Manga'" class="flex flex-col gap-1">
                  <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Autor</label>
                  <input
                    v-model="editForm.autor"
                    type="text"
                    class="rounded-lg border border-[var(--border-color)] bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-green-light focus:outline-none"
                    placeholder="Autor..."
                  />
                </div>
                <div v-else class="flex flex-col gap-1">
                  <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Estudio</label>
                  <input
                    v-model="editForm.estudio"
                    type="text"
                    class="rounded-lg border border-[var(--border-color)] bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-green-light focus:outline-none"
                    placeholder="Estudio..."
                  />
                </div>
              </div>

              <!-- Descripción editable -->
              <div class="flex flex-col gap-1.5">
                <label class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <StickyNote :size="13" />
                  Descripción
                </label>
                <textarea
                  v-model="editForm.nota"
                  class="min-h-[100px] w-full resize-y rounded-lg border border-[var(--border-color)] bg-bg-input p-3 font-body text-sm text-text-primary focus:border-green-light focus:outline-none"
                  placeholder="Sinopsis, resumen, impresiones o detalles de la obra..."
                />
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>
