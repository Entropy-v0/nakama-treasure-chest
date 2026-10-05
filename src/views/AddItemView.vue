<script setup lang="ts">
/**
 * AddItem.vue — Smart Component (refactorizado)
 * Orquesta la creación de un nuevo elemento en la colección.
 * Delega la selección visual a componentes Dumb especializados.
 *
 * Datos: useItemsStore (Pinia) → itemsService (Supabase o mocks locales).
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'
import { useCrewStore } from '../stores/crew'
import { useAlert } from '../composables/useAlert.js'
import { useMediaSearch } from '../composables/useMediaSearch'
import type { MediaSearchResult } from '../services/api/mediaSearch.service'
import type { ItemTipo, ItemEstado, DiaSemana } from '../types/items'
import { DIAS_SEMANA } from '../types/items'
import {
  TIPOS,
  ESTADOS,
  STATUS_COLORS,
  TYPE_META,
} from '../composables/useTypeMeta.js'

import PageContainer from '../components/layout/PageContainer.vue'
import TypeSelector from '../components/items/TypeSelector.vue'
import StatusSelector from '../components/items/StatusSelector.vue'
import ScoreSelector from '../components/items/ScoreSelector.vue'
import CoverPreview from '../components/items/CoverPreview.vue'
import { Sparkles, Users, User, Loader2 } from '@lucide/vue'

const emit = defineEmits<{
  'item-added': []
}>()
const router = useRouter()
const itemsStore = useItemsStore()
const crewStore = useCrewStore()
const { showAlert } = useAlert()
const { crew, hasCrew } = storeToRefs(crewStore)
const { results: searchResults, isSearching, showSuggestions, search: triggerMediaSearch } = useMediaSearch(450)

const shareScope = ref<'tripulacion' | 'personal'>(hasCrew.value ? 'tripulacion' : 'personal')

interface FormState {
  titulo: string
  tipo: ItemTipo
  portada: string
  link: string
  progreso: number | string | null
  estado: ItemEstado
  puntuacion: number | null
  generos: string
  nota: string
  anio: number | string
  autor: string
  estudio: string
  dia_semana: DiaSemana | null
}

const form = ref<FormState>({
  titulo:     '',
  tipo:       'Anime',
  portada:    '',
  link:       '',
  progreso:   null,
  estado:     'Pendiente',
  puntuacion: null,
  generos:    '',
  nota:       '',
  anio:       '',
  autor:      '',
  estudio:    '',
  dia_semana: null,
})

const showMangaFields = computed(() => form.value.tipo === 'Manga')
const showAnimeFields = computed(() => form.value.tipo === 'Anime' || form.value.tipo === 'Serie')

const progresoLabel = computed(() => {
  if (form.value.tipo === 'Manga') return 'Capítulo actual'
  if (form.value.tipo === 'Anime' || form.value.tipo === 'Serie') return 'Episodio actual'
  return 'Progreso / Capítulo'
})

const progresoPlaceholder = computed(() => {
  if (form.value.tipo === 'Manga') return 'ej: 1045'
  if (form.value.tipo === 'Anime' || form.value.tipo === 'Serie') return 'ej: 24'
  return 'ej: 1'
})

const handleTitleInput = () => {
  triggerMediaSearch(form.value.titulo, form.value.tipo)
}

const selectSuggestion = (result: MediaSearchResult) => {
  form.value.titulo = result.titulo
  if (result.portada) form.value.portada = result.portada
  if (result.anio) form.value.anio = result.anio
  if (result.sinopsis) form.value.nota = result.sinopsis
  if (result.generos && result.generos.length > 0) form.value.generos = result.generos.join(', ')
  if (result.estudio) form.value.estudio = result.estudio
  if (result.totalEpisodios) form.value.progreso = 0
  showSuggestions.value = false
}

const selectCrewScope = () => {
  if (hasCrew.value) {
    shareScope.value = 'tripulacion'
  }
}

const handleSubmit = async () => {
  if (!form.value.titulo.trim()) {
    await showAlert({ type: 'info', title: 'Campo requerido', message: 'El título es obligatorio.' })
    return
  }

  const generosList = form.value.generos
    ? form.value.generos.split(',').map(g => g.trim()).filter(Boolean)
    : []

  const isShared = hasCrew.value && shareScope.value === 'tripulacion' && Boolean(crew.value?.id)
  const crewPayload = isShared
    ? { crew_id: crew.value?.id || null }
    : { crew_id: null }

  try {
    await itemsStore.addItem({
      ...form.value,
      ...crewPayload,
      link: form.value.link?.trim() || null,
      progreso: form.value.progreso !== null && form.value.progreso !== '' ? parseInt(String(form.value.progreso), 10) : null,
      generos: generosList,
      anio: form.value.anio ? parseInt(String(form.value.anio), 10) : null,
    })

    await showAlert({ 
      type: 'success', 
      title: '¡Contenido añadido!', 
      message: `"${form.value.titulo}" fue agregado ${crewPayload.crew_id ? 'a la Tripulación (visible en el listado de todos los miembros)' : 'a tu colección personal'}.` 
    })

    form.value = {
      titulo: '', tipo: 'Anime', portada: '', link: '', progreso: null, estado: 'Pendiente',
      puntuacion: null, generos: '', nota: '', anio: '', autor: '', estudio: '',
      dia_semana: null,
    }

    emit('item-added')
    router.push('/collection')
  } catch (err: any) {
    await showAlert({
      type: 'warning',
      title: 'Error al agregar',
      message: err?.message || 'No se pudo guardar el elemento.',
    })
  }
}
</script>

<template>
  <PageContainer
    title="Agregar contenido"
    max-width="max-w-[1000px]"
  >
    <form class="w-full" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-2 gap-12 max-md:grid-cols-1 max-md:gap-8">

        <!-- ── Columna izquierda ── -->
        <div class="flex flex-col gap-[22px]">

          <!-- Selector de Destino (Individual vs Tripulación) -->
          <div class="flex flex-col gap-2 rounded-xl border border-white/10 bg-bg-card p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Destino del contenido
              </span>
              <span v-if="hasCrew" class="text-[11px] font-semibold text-green flex items-center gap-1">
                <Users :size="12" />
                <span>{{ crew?.name }}</span>
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1 mt-1">
              <!-- Opción: Solo mío -->
              <button
                type="button"
                class="flex flex-col gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer"
                :class="shareScope === 'personal'
                  ? 'border-green bg-green/10 shadow-[0_0_12px_rgba(70,211,105,0.15)]'
                  : 'border-white/5 bg-bg-surface hover:border-white/20'"
                @click="shareScope = 'personal'"
              >
                <div class="flex items-center gap-1.5">
                  <User :size="14" :class="shareScope === 'personal' ? 'text-green' : 'text-text-muted'" />
                  <span class="text-xs font-bold text-white">Solo para mí</span>
                </div>
                <p class="text-[11px] text-text-muted leading-tight">
                  Contenido personal. Solo tú podrás verlo en tu colección.
                </p>
              </button>

              <!-- Opción: Tripulación -->
              <button
                type="button"
                :disabled="!hasCrew"
                class="flex flex-col gap-1 p-3 rounded-xl border text-left transition-all"
                :class="[
                  !hasCrew ? 'opacity-40 cursor-not-allowed border-white/5 bg-bg-surface' : 'cursor-pointer',
                  shareScope === 'tripulacion' && hasCrew
                    ? 'border-green bg-green/10 shadow-[0_0_12px_rgba(70,211,105,0.15)]'
                    : 'border-white/5 bg-bg-surface hover:border-white/20'
                ]"
                @click="selectCrewScope"
              >
                <div class="flex items-center gap-1.5">
                  <Users :size="14" :class="shareScope === 'tripulacion' && hasCrew ? 'text-green' : 'text-text-muted'" />
                  <span class="text-xs font-bold text-white">Compartir con Tripulación</span>
                </div>
                <p class="text-[11px] text-text-muted leading-tight">
                  <span v-if="hasCrew">Aparece en el listado de todos los miembros para ver juntos.</span>
                  <span v-else class="text-gold">Requiere unirse o crear una Tripulación primero.</span>
                </p>
              </button>
            </div>
          </div>

          <!-- Tipo de contenido -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">Tipo</label>
            <TypeSelector
              v-model="form.tipo"
              :types="TIPOS"
              :type-meta="TYPE_META"
            />
          </div>

          <!-- Título con Autocompletado Público -->
          <div class="relative flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="titulo">
                Título <span class="text-green">*</span>
              </label>
              <span class="flex items-center gap-1 text-[11px] font-medium text-green">
                <Sparkles :size="12" />
                <span>Autocompletado inteligente</span>
              </span>
            </div>

            <div class="relative">
              <input
                id="titulo"
                v-model="form.titulo"
                type="text"
                class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] pr-9 text-sm text-text-primary focus:border-green focus:outline-none"
                placeholder="Escribe el título para autocompletar portada y datos..."
                @input="handleTitleInput"
                @focus="searchResults.length > 0 ? showSuggestions = true : null"
              />
              <div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2 text-green animate-spin">
                <Loader2 :size="16" />
              </div>
            </div>

            <!-- Menú flotante de resultados -->
            <div
              v-if="showSuggestions && searchResults.length > 0"
              class="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border-default bg-bg-surface p-1.5 shadow-2xl backdrop-blur-md space-y-1"
            >
              <div
                v-for="res in searchResults"
                :key="res.id"
                class="flex items-center gap-3 rounded-lg p-2 hover:bg-bg-elevated cursor-pointer transition-colors"
                @click="selectSuggestion(res)"
              >
                <img
                  v-if="res.portada"
                  :src="res.portada"
                  :alt="res.titulo"
                  class="h-12 w-9 rounded object-cover shrink-0 border border-border-default"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-text-primary truncate">{{ res.titulo }}</p>
                  <p class="text-[11px] text-text-muted mt-0.5">
                    {{ res.anio ? res.anio + ' • ' : '' }}{{ res.generos?.slice(0, 2).join(', ') }}
                  </p>
                </div>
                <span class="text-[10px] font-semibold text-green uppercase shrink-0 px-2 py-0.5 rounded bg-green/10">
                  Rellenar
                </span>
              </div>
            </div>
          </div>

          <!-- Estado -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">Estado</label>
            <StatusSelector
              v-model="form.estado"
              :statuses="ESTADOS"
              :status-colors="STATUS_COLORS"
            />
          </div>

          <!-- Puntuación -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">Puntuación</label>
            <ScoreSelector v-model="form.puntuacion" />
          </div>

          <!-- Día de emisión semanal (Calendario) -->
          <div v-if="form.tipo !== 'Película'" class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">
              Día de emisión semanal <span class="font-normal text-xs text-text-muted">(para el Calendario)</span>
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="dia in DIAS_SEMANA"
                :key="dia"
                type="button"
                class="rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer"
                :class="form.dia_semana === dia ? 'border-green bg-green/10 text-green font-bold shadow-sm' : 'border-white/5 bg-bg-card text-text-muted hover:text-white'"
                @click="form.dia_semana = form.dia_semana === dia ? null : dia"
              >
                {{ dia }}
              </button>
            </div>
          </div>

          <!-- Progreso / Capítulo o Episodio (no aplica a Película) -->
          <div v-if="form.tipo !== 'Película'" class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="progreso">
              {{ progresoLabel }} <span class="font-normal tracking-normal text-xs text-text-muted">(en el que vas)</span>
            </label>
            <input
              id="progreso"
              v-model="form.progreso"
              type="number"
              min="0"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              :placeholder="progresoPlaceholder"
            />
          </div>

          <!-- Año -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="anio">Año</label>
            <input
              id="anio"
              v-model="form.anio"
              type="number"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              placeholder="ej: 2024"
              min="1900"
              max="2099"
            />
          </div>

          <!-- Autor (solo Manga) -->
          <div v-if="showMangaFields" class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="autor">Autor</label>
            <input
              id="autor"
              v-model="form.autor"
              type="text"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              placeholder="ej: Kentaro Miura"
            />
          </div>

          <!-- Estudio (Anime / Serie) -->
          <div v-if="showAnimeFields" class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="estudio">Estudio / Cadena</label>
            <input
              id="estudio"
              v-model="form.estudio"
              type="text"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              placeholder="ej: MAPPA, Netflix..."
            />
          </div>

          <!-- Géneros -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="generos">
              Géneros <span class="font-normal tracking-normal text-xs text-text-muted">(separados por coma)</span>
            </label>
            <input
              id="generos"
              v-model="form.generos"
              type="text"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              placeholder="Acción, Aventura, Romance..."
            />
          </div>
        </div>

        <!-- ── Columna derecha ── -->
        <div class="flex flex-col gap-[22px]">

          <!-- URL de portada -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="portada">URL de portada</label>
            <input
              id="portada"
              v-model="form.portada"
              type="url"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              placeholder="https://imagen.jpg"
            />
          </div>

          <!-- Enlace web / Link -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="link">
              Enlace web <span class="font-normal tracking-normal text-xs text-text-muted">(para ver o leer)</span>
            </label>
            <input
              id="link"
              v-model="form.link"
              type="url"
              class="w-full rounded-lg border border-[var(--border-color)] bg-bg-input px-3.5 py-[11px] text-sm text-text-primary"
              placeholder="https://ejemplo.com/ver-contenido..."
            />
          </div>

          <!-- Cover Preview -->
          <CoverPreview
            :url="form.portada"
            :type-meta="TYPE_META[form.tipo] || {}"
          />

          <!-- Descripción -->
          <div class="flex flex-1 flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary" for="nota">Descripción</label>
            <textarea
              id="nota"
              v-model="form.nota"
              class="min-h-[130px] w-full flex-1 resize-y rounded-lg border border-[var(--border-color)] bg-bg-input p-3.5 font-body text-sm text-text-primary"
              placeholder="Sinopsis, resumen, impresiones o detalles de la obra..."
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="mt-auto flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-green-light bg-green-dark p-3.5 font-body text-[15px] font-bold text-white transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-green-light hover:text-bg-base hover:shadow-[0_0_24px_rgba(61,122,85,0.14)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar a la colección
          </button>
        </div>
      </div>
    </form>
  </PageContainer>
</template>
