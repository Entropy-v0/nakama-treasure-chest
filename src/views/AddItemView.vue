<script setup lang="ts">
/**
 * AddItemView.vue — Smart Component
 * Vista orquestadora para agregar y editar items.
 * Layout optimizado en 2 columnas en PC (60% formulario / 40% panel multimedia sticky).
 */
import { useItemForm } from '../composables/useItemForm'
import { TYPE_META, ITEM_YEAR_LIMITS } from '../constants/itemMeta'
import PageContainer from '../components/layout/PageContainer.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import FormInput from '../components/ui/FormInput.vue'
import FormTextarea from '../components/ui/FormTextarea.vue'
import TypeSelector from '../components/items/TypeSelector.vue'
import StatusSelector from '../components/items/StatusSelector.vue'
import ScoreSelector from '../components/items/ScoreSelector.vue'
import CoverPreview from '../components/items/CoverPreview.vue'
import ScopeRadioGroup from '../components/items/ScopeRadioGroup.vue'
import MediaSearchInput from '../components/items/MediaSearchInput.vue'
import CoverInput from '../components/items/CoverInput.vue'
import WeekdaySelector from '../components/items/WeekdaySelector.vue'
import { Check, Plus, Sliders, BookOpen, Sparkles } from '@lucide/vue'

const emit = defineEmits<{
  'item-added': []
}>()

const {
  form,
  isEditing,
  isSubmitting,
  shareScope,
  hasCrew,
  crew,
  currentConfig,
  activeCoverUrl,
  searchResults,
  isSearching,
  selectedFile,
  selectedFileName,
  previewUrl,
  handleTitleInput,
  selectSuggestion,
  handleFileChange,
  clearSelectedFile,
  handleUrlInput,
  selectCrewScope,
  setTodayFinishedDate,
  handleSubmit,
} = useItemForm({
  onSuccess: () => emit('item-added'),
})
</script>

<template>
  <PageContainer
    :title="isEditing ? 'Editar contenido' : 'Agregar contenido'"
    max-width="max-w-[1080px]"
  >
    <form class="w-full" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-12 gap-8 max-lg:grid-cols-1">

        <!-- ── Columna Principal (7 cols en PC) ── -->
        <div class="col-span-7 flex flex-col gap-6 max-lg:col-span-12">
          <!-- Selector de Destino (Individual vs Tripulación) -->
          <ScopeRadioGroup
            v-model="shareScope"
            :has-crew="hasCrew"
            :crew-name="crew?.name"
            @request-crew="selectCrewScope"
          />

          <!-- Tipo de contenido -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">Tipo</label>
            <TypeSelector v-model="form.tipo" />
          </div>

          <!-- Título con Autocompletado Público -->
          <MediaSearchInput
            v-model="form.titulo"
            :results="searchResults"
            :is-searching="isSearching"
            @search-input="handleTitleInput"
            @select-suggestion="selectSuggestion"
          />

          <!-- ── Tarjeta 1: Mi Seguimiento ── -->
          <div class="flex flex-col gap-5 rounded-2xl border border-white/5 bg-bg-surface/60 p-5 shadow-sm">
            <div class="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sliders :size="16" class="text-green" />
              <h3 class="text-xs font-bold uppercase tracking-[1px] text-text-secondary">Mi Seguimiento</h3>
            </div>

            <!-- Estado -->
            <div class="flex flex-col gap-2">
              <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">Estado</label>
              <StatusSelector v-model="form.estado" />
            </div>

            <!-- Puntuación -->
            <div class="flex flex-col gap-2">
              <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">Puntuación</label>
              <ScoreSelector v-model="form.puntuacion" />
            </div>

            <!-- Temporada y Progreso en 2 columnas -->
            <div
              v-if="currentConfig.hasProgress"
              class="grid gap-3"
              :class="currentConfig.hasSeason ? 'grid-cols-2 max-sm:grid-cols-1' : 'grid-cols-1'"
            >
              <!-- Temporada (solo Anime/Serie) -->
              <FormInput
                v-if="currentConfig.hasSeason"
                id="temporada"
                v-model="form.temporada"
                type="number"
                min="0"
                label="Temporada actual"
                hint="(en la que vas)"
                placeholder="ej: 1"
              />

              <!-- Progreso / Capítulo, Episodio o Página -->
              <FormInput
                id="progreso"
                v-model="form.progreso"
                type="number"
                min="0"
                :label="currentConfig.progressLabel || 'Progreso actual'"
                hint="(en el que vas)"
                :placeholder="currentConfig.progressPlaceholder || 'ej: 1'"
              />
            </div>

            <!-- Emisión y Fecha de Finalización -->
            <div
              v-if="form.estado === 'Completado' || currentConfig.hasBroadcastDay"
              class="grid gap-3"
              :class="(form.estado === 'Completado' && currentConfig.hasBroadcastDay) ? 'grid-cols-2 max-sm:grid-cols-1' : 'grid-cols-1'"
            >
              <!-- Día de emisión semanal (Calendario) -->
              <WeekdaySelector
                v-if="currentConfig.hasBroadcastDay"
                v-model="form.dia_semana"
              />

              <!-- Fecha de cuando se terminó (solo si Completado) -->
              <FormInput
                v-if="form.estado === 'Completado'"
                id="fecha_terminado"
                v-model="form.fecha_terminado"
                type="date"
                label="Fecha finalizado"
                hint="(opcional)"
              >
                <template #label-extra>
                  <button
                    type="button"
                    class="text-[11px] font-bold text-green hover:underline cursor-pointer transition-colors"
                    title="Poner la fecha de hoy"
                    @click="setTodayFinishedDate"
                  >
                    Hoy
                  </button>
                </template>
              </FormInput>
            </div>
          </div>

          <!-- ── Tarjeta 2: Ficha Técnica & Metadatos ── -->
          <div class="flex flex-col gap-4.5 rounded-2xl border border-white/5 bg-bg-surface/60 p-5 shadow-sm">
            <div class="flex items-center gap-2 border-b border-white/5 pb-3">
              <BookOpen :size="16" class="text-green" />
              <h3 class="text-xs font-bold uppercase tracking-[1px] text-text-secondary">Ficha Técnica & Notas</h3>
            </div>

            <!-- Año y Géneros en 2 columnas -->
            <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <!-- Año -->
              <FormInput
                id="anio"
                v-model="form.anio"
                type="number"
                :min="ITEM_YEAR_LIMITS.MIN"
                :max="ITEM_YEAR_LIMITS.MAX"
                label="Año"
                placeholder="ej: 2024"
              />

              <!-- Géneros -->
              <FormInput
                id="generos"
                v-model="form.generos"
                type="text"
                label="Géneros"
                hint="(por coma)"
                placeholder="Acción, Fantasía..."
              />
            </div>

            <!-- Creador / Autor y Estudio / Editorial en 2 columnas -->
            <div
              v-if="currentConfig.creatorLabel || currentConfig.publisherLabel"
              class="grid gap-3"
              :class="(currentConfig.creatorLabel && currentConfig.publisherLabel) ? 'grid-cols-2 max-sm:grid-cols-1' : 'grid-cols-1'"
            >
              <!-- Creador / Autor / Mangaka -->
              <FormInput
                v-if="currentConfig.creatorLabel"
                id="autor"
                v-model="form.autor"
                type="text"
                :label="currentConfig.creatorLabel"
                :placeholder="currentConfig.creatorPlaceholder"
              />

              <!-- Publicador / Estudio / Editorial -->
              <FormInput
                v-if="currentConfig.publisherLabel"
                id="estudio"
                v-model="form.estudio"
                type="text"
                :label="currentConfig.publisherLabel"
                :placeholder="currentConfig.publisherPlaceholder"
              />
            </div>

            <!-- Descripción / Sinopsis -->
            <FormTextarea
              id="nota"
              v-model="form.nota"
              label="Descripción o notas personales"
              placeholder="Sinopsis, resumen, impresiones o detalles de la obra..."
              :rows="4"
            />
          </div>
        </div>

        <!-- ── Columna Lateral (5 cols en PC, sticky) ── -->
        <div class="col-span-5 flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start max-lg:col-span-12">
          <!-- Tarjeta Multimedia (Preview + Input de Portada + Enlace) -->
          <div class="flex flex-col gap-4.5 rounded-2xl border border-white/5 bg-bg-surface/60 p-5 shadow-sm">
            <div class="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles :size="16" class="text-green" />
              <h3 class="text-xs font-bold uppercase tracking-[1px] text-text-secondary">Portada & Enlaces</h3>
            </div>

            <!-- Preview de Portada -->
            <div class="mx-auto w-full max-w-[220px]">
              <CoverPreview
                :url="activeCoverUrl"
                :type-meta="TYPE_META[form.tipo] || {}"
              />
            </div>

            <!-- Selector de archivo o URL de portada -->
            <CoverInput
              :url="form.portada"
              :selected-file-name="selectedFileName"
              :has-file="Boolean(selectedFile || previewUrl)"
              @update:url="val => { form.portada = val; handleUrlInput(); }"
              @file-change="handleFileChange"
              @clear-file="clearSelectedFile"
            />

            <!-- Enlace web / Link -->
            <FormInput
              id="link"
              v-model="form.link"
              type="url"
              label="Enlace web"
              hint="(para ver o leer)"
              placeholder="https://ejemplo.com/ver..."
            />
          </div>

          <!-- Botón de Envío Principal -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="isSubmitting"
            loading-text="Guardando..."
            class="shadow-[0_4px_24px_rgba(40,167,69,0.25)]"
          >
            <template #icon-left>
              <Check v-if="isEditing" :size="18" stroke-width="2.5" />
              <Plus v-else :size="18" stroke-width="2.5" />
            </template>
            {{ isEditing ? 'Guardar cambios' : 'Agregar a la colección' }}
          </BaseButton>
        </div>

      </div>
    </form>
  </PageContainer>
</template>
