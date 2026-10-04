<script setup>
/**
 * ItemList.vue — Smart Component (refactorizado)
 * Orquesta filtros, búsqueda, grid y paginación de la colección.
 * Delega toda la presentación a dumb components.
 *
 * Datos: siguen siendo Mocks via useItems (Fase 1: NO conectar Supabase).
 */
import { ref, computed, onMounted } from 'vue'
import { useItems } from '../composables/useItems.js'
import {
  TYPE_META,
  TYPE_TABS_META,
  STATUS_COLORS,
  TIPOS_FILTER,
  ESTADOS_FILTER,
} from '../composables/useTypeMeta.js'
import PageContainer from '../components/layout/PageContainer.vue'
import ItemDetailsModal from '../components/ItemDetailsModal.vue'

import SearchBar from '../components/collection/SearchBar.vue'
import FilterTabs from '../components/collection/FilterTabs.vue'
import StatusFilter from '../components/collection/StatusFilter.vue'
import ItemCard from '../components/collection/ItemCard.vue'
import { useCrew } from '../composables/useCrew'
import { Layers, Users, User, Ship } from '@lucide/vue'

const { items, isLoading, isLoaded, loadItems } = useItems()
const { crew, hasCrew, loadCrewData } = useCrew()
const selectedItemId = ref(null)
const selectedItem = computed(() => {
  if (selectedItemId.value === null) return null
  return items.value.find(i => i.id === selectedItemId.value) || null
})

onMounted(async () => {
  loadCrewData()
  if (!isLoaded.value) {
    try {
      await loadItems()
    } catch (e) {
      console.warn('[ItemList] Error cargando items:', e)
    }
  }
})

/* ── Tab data para FilterTabs ── */
const typeTabs = TIPOS_FILTER.map(key => ({
  key,
  icon: TYPE_TABS_META[key]?.icon || null,
  color: TYPE_TABS_META[key]?.color || 'var(--zoro-green)',
}))

/* ── Estado de filtros ── */
const activeTipo   = ref('Todos')
const activeEstado = ref('Todos')
const activeScope  = ref('todos') // 'todos' | 'compartido' | 'personal'
const searchQuery  = ref('')

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchTipo   = activeTipo.value === 'Todos'   || item.tipo === activeTipo.value
    const matchEstado = activeEstado.value === 'Todos' || item.estado === activeEstado.value
    const matchSearch = item.titulo.toLowerCase().includes(searchQuery.value.toLowerCase())

    let matchScope = true
    if (hasCrew.value) {
      if (activeScope.value === 'compartido') matchScope = Boolean(item.crew_id)
      else if (activeScope.value === 'personal') matchScope = !item.crew_id
    }

    return matchTipo && matchEstado && matchSearch && matchScope
  })
})

/* ── Paginación ── */
const itemsPerPage = 18
const currentPage  = ref(1)
const totalPages   = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage) || 1)
const paginated    = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

const setTipo   = (t) => { activeTipo.value = t;   currentPage.value = 1 }
const setEstado = (e) => { activeEstado.value = e; currentPage.value = 1 }

const clearFilters = () => {
  activeTipo.value = 'Todos'
  activeEstado.value = 'Todos'
  searchQuery.value = ''
}
</script>

<template>
  <PageContainer title="Colección">
    <template #title-suffix>
      <!-- Selector de Ámbito (Personal vs Tripulación Compartida) -->
      <div v-if="hasCrew" class="flex items-center gap-1 bg-bg-surface border border-white/5 p-1 rounded-xl">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="activeScope === 'todos' ? 'bg-green text-black font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'"
          @click="activeScope = 'todos'"
        >
          <Layers :size="13" />
          <span>Todos</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="activeScope === 'compartido' ? 'bg-green text-black font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'"
          @click="activeScope = 'compartido'"
        >
          <Users :size="13" />
          <span>Compartidos</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="activeScope === 'personal' ? 'bg-green text-black font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'"
          @click="activeScope = 'personal'"
        >
          <User :size="13" />
          <span>Solo mío</span>
        </button>
      </div>
    </template>

    <template #header-actions>
      <SearchBar v-model="searchQuery" />
    </template>

    <!-- Tabs por tipo -->
    <div class="mb-3">
      <FilterTabs
        :tabs="typeTabs"
        :active="activeTipo"
        @select="setTipo"
      />
    </div>

    <!-- Filtro por estado -->
    <div class="mb-5">
      <StatusFilter
        :estados="ESTADOS_FILTER"
        :active="activeEstado"
        :status-colors="STATUS_COLORS"
        @select="setEstado"
      />
    </div>

    <!-- Contador -->
    <p class="mb-5 text-[13px] text-text-muted">
      <span class="font-bold text-green">{{ filteredItems.length }}</span>
      resultado{{ filteredItems.length !== 1 ? 's' : '' }}
    </p>

    <!-- Grid -->
    <div
      v-if="paginated.length > 0"
      class="mb-10 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-5 max-lg:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-md:grid-cols-2"
    >
      <ItemCard
        v-for="item in paginated"
        :key="item.id"
        :item="item"
        :type-meta="TYPE_META[item.tipo] || {}"
        :status-color="STATUS_COLORS[item.estado] || 'var(--zoro-green)'"
        @select="selectedItemId = item.id"
      />
    </div>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center gap-4 py-20 text-center">
      <svg class="text-white" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <p class="text-base text-text-secondary">No hay resultados para los filtros seleccionados.</p>
      <button
        class="cursor-pointer rounded-lg border border-[var(--border-color)] bg-bg-card px-6 py-2.5 font-body text-sm text-text-secondary transition-all duration-200 hover:border-[var(--zoro-green-border)] hover:text-green"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-5 border-t border-white/5 pt-6">
      <button
        class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-card font-body text-lg text-text-primary transition-all duration-200 hover:border-[var(--zoro-green-border)] hover:text-green disabled:cursor-not-allowed disabled:opacity-30"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        ‹
      </button>
      <span class="text-sm font-semibold text-text-muted">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-card font-body text-lg text-text-primary transition-all duration-200 hover:border-[var(--zoro-green-border)] hover:text-green disabled:cursor-not-allowed disabled:opacity-30"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        ›
      </button>
    </div>

    <!-- Modal -->
    <ItemDetailsModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItemId = null"
    />
  </PageContainer>
</template>
