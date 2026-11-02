import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'
import { useCrewStore } from '../stores/crew'
import { useAuthStore } from '../stores/auth'
import { storageService } from '../services/supabase/storage.service'
import { useAlert } from './useAlert'
import { useMediaSearch } from './useMediaSearch'
import { useImageUpload } from './useImageUpload'
import type { MediaSearchResult } from '../services/api/mediaSearch.service'
import type { ItemTipo, ItemEstado, DiaSemana } from '../types/items'
import { TYPE_CONFIG } from '../constants/itemMeta'
import { safeParseInt } from '../utils/number'

export interface ItemFormState {
  titulo: string
  tipo: ItemTipo
  portada: string
  link: string
  progreso: number | string | null
  temporada: number | string | null
  fecha_terminado: string | null
  estado: ItemEstado
  puntuacion: number | null
  generos: string
  nota: string
  anio: number | string
  autor: string
  estudio: string
  dia_semana: DiaSemana | null
}

export interface UseItemFormOptions {
  onSuccess?: () => void
}

/**
 * useItemForm — Composable para orquestar la lógica de creación y edición de items.
 *
 * Desacopla la vista de:
 * - El estado reactivo del formulario y reseteos.
 * - La carga de datos en modo edición (`loadExistingItem`).
 * - La coordinación de búsqueda externa AniList/TVMaze (`selectSuggestion`).
 * - La subida de imágenes a Supabase Storage y construcción del payload sanitizado.
 */
export function useItemForm(options: UseItemFormOptions = {}) {
  const router = useRouter()
  const route = useRoute()
  const itemsStore = useItemsStore()
  const crewStore = useCrewStore()
  const authStore = useAuthStore()
  const { showAlert } = useAlert()

  const { crew, hasCrew } = storeToRefs(crewStore)
  const { results: searchResults, isSearching, search: triggerMediaSearch, clearResults: clearMediaSearch } = useMediaSearch(450)

  const isSubmitting = ref(false)
  const shareScope = ref<'tripulacion' | 'personal'>(hasCrew.value ? 'tripulacion' : 'personal')

  const initialFormState = (): ItemFormState => ({
    titulo: '',
    tipo: 'Anime',
    portada: '',
    link: '',
    progreso: null,
    temporada: null,
    fecha_terminado: null,
    estado: 'Pendiente',
    puntuacion: null,
    generos: '',
    nota: '',
    anio: '',
    autor: '',
    estudio: '',
    dia_semana: null,
  })

  const form = ref<ItemFormState>(initialFormState())

  const currentConfig = computed(() => TYPE_CONFIG[form.value.tipo] || TYPE_CONFIG['Anime'])
  const editId = computed(() => safeParseInt(route.params.id))
  const isEditing = computed(() => editId.value !== null)

  const {
    selectedFile,
    previewUrl,
    selectedFileName,
    handleFileChange,
    clearFile: clearSelectedFile,
  } = useImageUpload()

  const activeCoverUrl = computed<string | undefined>(() => {
    return previewUrl.value || form.value.portada || undefined
  })

  const handleUrlInput = () => {
    if (selectedFile.value) {
      clearSelectedFile()
    }
  }

  const loadExistingItem = async () => {
    if (!isEditing.value || editId.value === null) return

    if (!itemsStore.isLoaded) {
      await itemsStore.loadItems()
    }

    const existing = itemsStore.items.find(i => i.id === editId.value)
    if (!existing) {
      await showAlert({
        type: 'error',
        title: 'Elemento no encontrado',
        message: 'No se encontró el contenido que deseas editar en tu colección.',
      })
      router.push('/collection')
      return
    }

    clearSelectedFile()
    form.value = {
      titulo: existing.titulo,
      tipo: existing.tipo,
      portada: existing.portada || '',
      link: existing.link || '',
      progreso: existing.progreso ?? null,
      temporada: existing.temporada ?? null,
      fecha_terminado: existing.fecha_terminado ?? null,
      estado: existing.estado,
      puntuacion: existing.puntuacion ?? null,
      generos: Array.isArray(existing.generos) ? existing.generos.join(', ') : '',
      nota: existing.nota || '',
      anio: existing.anio ?? '',
      autor: existing.autor || '',
      estudio: existing.estudio || '',
      dia_semana: existing.dia_semana || null,
    }

    shareScope.value = existing.crew_id ? 'tripulacion' : 'personal'
  }

  onMounted(() => {
    loadExistingItem()
  })

  watch(() => route.params.id, () => {
    loadExistingItem()
  })

  const handleTitleInput = () => {
    triggerMediaSearch(form.value.titulo, form.value.tipo)
  }

  const selectSuggestion = (result: MediaSearchResult) => {
    form.value.titulo = result.titulo
    if (result.portada) {
      clearSelectedFile()
      form.value.portada = result.portada
    }
    if (result.anio) form.value.anio = result.anio
    if (result.sinopsis) form.value.nota = result.sinopsis
    if (result.generos && result.generos.length > 0) form.value.generos = result.generos.join(', ')
    if (result.estudio) form.value.estudio = result.estudio
    if (result.autor) form.value.autor = result.autor
    if (result.totalEpisodios) form.value.progreso = 0
    clearMediaSearch()
  }

  const selectCrewScope = () => {
    if (hasCrew.value) {
      shareScope.value = 'tripulacion'
    }
  }

  const setTodayFinishedDate = () => {
    form.value.fecha_terminado = new Date().toISOString().split('T')[0]
  }

  const handleSubmit = async () => {
    if (!form.value.titulo.trim()) {
      await showAlert({ type: 'info', title: 'Campo requerido', message: 'El título es obligatorio.' })
      return
    }

    isSubmitting.value = true

    try {
      let portadaUrl = form.value.portada?.trim() || null

      if (selectedFile.value) {
        portadaUrl = await storageService.uploadCover(selectedFile.value, authStore.user?.id)
      }

      const generosList = form.value.generos
        ? form.value.generos.split(',').map(g => g.trim()).filter(Boolean)
        : []

      const isShared = hasCrew.value && shareScope.value === 'tripulacion' && Boolean(crew.value?.id)
      const crewPayload = isShared
        ? { crew_id: crew.value?.id || null }
        : { crew_id: null }

      const itemPayload = {
        ...form.value,
        ...crewPayload,
        portada: portadaUrl,
        link: form.value.link?.trim() || null,
        progreso: currentConfig.value.hasProgress ? safeParseInt(form.value.progreso) : null,
        temporada: currentConfig.value.hasSeason ? safeParseInt(form.value.temporada) : null,
        fecha_terminado: form.value.estado === 'Completado' ? (form.value.fecha_terminado?.trim() || null) : null,
        generos: generosList,
        anio: safeParseInt(form.value.anio),
        autor: currentConfig.value.creatorLabel ? (form.value.autor?.trim() || null) : null,
        estudio: currentConfig.value.publisherLabel ? (form.value.estudio?.trim() || null) : null,
        dia_semana: currentConfig.value.hasBroadcastDay ? form.value.dia_semana : null,
      }

      if (isEditing.value && editId.value !== null) {
        await itemsStore.updateItem(editId.value, itemPayload)
        await showAlert({
          type: 'success',
          title: '¡Actualizado!',
          message: `"${form.value.titulo}" fue actualizado exitosamente.`,
        })
        clearSelectedFile()
        options.onSuccess?.()
        router.push('/collection')
        return
      }

      await itemsStore.addItem(itemPayload)

      await showAlert({
        type: 'success',
        title: '¡Contenido añadido!',
        message: `"${form.value.titulo}" fue agregado ${crewPayload.crew_id ? 'a la Tripulación (visible en el listado de todos los miembros)' : 'a tu colección personal'}.`,
      })

      form.value = initialFormState()
      clearSelectedFile()

      options.onSuccess?.()
      router.push('/collection')
    } catch (err: any) {
      await showAlert({
        type: 'warning',
        title: isEditing.value ? 'Error al actualizar' : 'Error al agregar',
        message: err?.message || 'No se pudo guardar el elemento.',
      })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isEditing,
    editId,
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
  }
}

