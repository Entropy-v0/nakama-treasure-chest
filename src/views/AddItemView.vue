<script setup lang="ts">
/**
 * AddItemView.vue — Smart Component
 * Vista orquestadora para agregar y editar items.
 * La lógica de estado, validación y almacenamiento está desacoplada en useItemForm.
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
import { Check, Plus } from '@lucide/vue'

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
  handleSubmit,
} = useItemForm({
  onSuccess: () => emit('item-added'),
})
</script>

<template>
  <PageContainer
    :title="isEditing ? 'Editar contenido' : 'Agregar contenido'"
    max-width="max-w-[1000px]"
  >
    <form class="w-full" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-2 gap-12 max-md:grid-cols-1 max-md:gap-8">

        <!-- ── Columna izquierda ── -->
        <div class="flex flex-col gap-[22px]">
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

          <!-- Día de emisión semanal (Calendario) -->
          <WeekdaySelector
            v-if="currentConfig.hasBroadcastDay"
            v-model="form.dia_semana"
          />

          <!-- Progreso / Capítulo, Episodio o Página -->
          <FormInput
            v-if="currentConfig.hasProgress"
            id="progreso"
            v-model="form.progreso"
            type="number"
            min="0"
            :label="currentConfig.progressLabel || 'Progreso actual'"
            hint="(en el que vas)"
            :placeholder="currentConfig.progressPlaceholder || 'ej: 1'"
          />

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

          <!-- Creador / Autor / Mangaka / Artista -->
          <FormInput
            v-if="currentConfig.creatorLabel"
            id="autor"
            v-model="form.autor"
            type="text"
            :label="currentConfig.creatorLabel"
            :placeholder="currentConfig.creatorPlaceholder"
          />

          <!-- Publicador / Estudio / Editorial / Sello -->
          <FormInput
            v-if="currentConfig.publisherLabel"
            id="estudio"
            v-model="form.estudio"
            type="text"
            :label="currentConfig.publisherLabel"
            :placeholder="currentConfig.publisherPlaceholder"
          />

          <!-- Géneros -->
          <FormInput
            id="generos"
            v-model="form.generos"
            type="text"
            label="Géneros"
            hint="(separados por coma)"
            placeholder="Acción, Aventura, Romance..."
          />
        </div>

        <!-- ── Columna derecha ── -->
        <div class="flex flex-col gap-[22px]">
          <!-- Portada / Carátula (Subida de archivo o URL) -->
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
            placeholder="https://ejemplo.com/ver-contenido..."
          />

          <!-- Cover Preview -->
          <CoverPreview
            :url="activeCoverUrl"
            :type-meta="TYPE_META[form.tipo] || {}"
          />

          <!-- Descripción -->
          <div class="flex flex-1 flex-col">
            <FormTextarea
              id="nota"
              v-model="form.nota"
              label="Descripción"
              placeholder="Sinopsis, resumen, impresiones o detalles de la obra..."
              :rows="5"
            />
          </div>

          <!-- Submit -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="isSubmitting"
            loading-text="Guardando..."
            class="mt-auto"
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
