import { ref, onScopeDispose } from 'vue'
import { mediaSearchService, type MediaSearchResult } from '../services/api/mediaSearch.service'
import type { ItemTipo } from '../types/items'

/**
 * Composable para autocompletado y búsqueda de contenido multimedia externo.
 * Implementa debounce y cancelación de peticiones anteriores en vuelo (AbortController)
 * para evitar condiciones de carrera y fugas de memoria.
 */
export function useMediaSearch(delay = 450) {
  const results = ref<MediaSearchResult[]>([])
  const isSearching = ref(false)
  const showSuggestions = ref(false)

  let timeout: ReturnType<typeof setTimeout> | undefined
  let abortController: AbortController | null = null

  const clearResults = () => {
    if (timeout) clearTimeout(timeout)
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    results.value = []
    showSuggestions.value = false
    isSearching.value = false
  }

  const search = (query: string, tipo: ItemTipo) => {
    if (timeout) clearTimeout(timeout)
    if (abortController) {
      abortController.abort()
      abortController = null
    }

    const cleanQuery = query ? query.trim() : ''
    if (cleanQuery.length < 2) {
      results.value = []
      showSuggestions.value = false
      isSearching.value = false
      return
    }

    timeout = setTimeout(async () => {
      abortController = new AbortController()
      isSearching.value = true
      try {
        const data = await mediaSearchService.search(cleanQuery, tipo, abortController.signal)
        results.value = data
        showSuggestions.value = data.length > 0
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('[useMediaSearch] Error en búsqueda multimedia:', err)
          results.value = []
          showSuggestions.value = false
        }
      } finally {
        isSearching.value = false
      }
    }, delay)
  }

  onScopeDispose(() => {
    clearResults()
  })

  return {
    results,
    isSearching,
    showSuggestions,
    search,
    clearResults,
  }
}
