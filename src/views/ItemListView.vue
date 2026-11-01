<script setup lang="ts">
/**
 * ItemListView.vue — Smart Component
 * Orquesta la visualización de la colección completa.
 * Consume el motor centralizado useItemFilters para búsqueda, filtrado y paginación.
 */
import { ref, computed } from 'vue'
import { useCollectionData } from '../composables/useCollectionData'
import { useItemFilters } from '../composables/useItemFilters'
import {
  TYPE_TABS_META,
  TIPOS_FILTER,
} from '../constants/itemMeta'

import PageContainer from '../components/layout/PageContainer.vue'
import SearchBar from '../components/collection/SearchBar.vue'
import FilterTabs, { type FilterTabItem } from '../components/collection/FilterTabs.vue'
import StatusFilter from '../components/collection/StatusFilter.vue'
import ItemGrid from '../components/collection/ItemGrid.vue'
import PaginationBar from '../components/ui/PaginationBar.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import ScopeFilter from '../components/ui/ScopeFilter.vue'
import ItemDetailsModal from '../components/items/ItemDetailsModal.vue'

// Datos + carga inicial centralizada
const { items, isLoading, hasCrew } = useCollectionData('ItemListView')

// Motor centralizado de filtrado y paginación
const {
  activeTipo,
  activeEstado,
  activeScope,
  searchQuery,
  currentPage,
  totalPages,
  filteredItems,
  paginatedItems: paginated,
  setTipo,
  setEstado,
  clearFilters,
} = useItemFilters(items, { hasCrew, itemsPerPage: 20 })

const selectedItemId = ref<number | null>(null)
const selectedItem = computed(() => {
  if (selectedItemId.value === null) return null
  return items.value.find(i => i.id === selectedItemId.value) || null
})

/* ── Tab data para FilterTabs ── */
const typeTabs: FilterTabItem[] = TIPOS_FILTER.map(key => {
  const meta = TYPE_TABS_META[key as keyof typeof TYPE_TABS_META]
  return {
    key,
    icon: meta?.icon || null,
    color: meta?.color || 'var(--zoro-green)',
  }
})
</script>

<template>
  <PageContainer
    title="Colección"
    subtitle="Explora y gestiona tu contenido"
    :loading="isLoading"
  >
    <template #title-suffix>
      <ScopeFilter v-if="hasCrew" v-model="activeScope" />
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
        :active="activeEstado"
        @select="setEstado"
      />
    </div>

    <!-- Contador de resultados -->
    <p class="mb-5 text-[13px] text-text-muted">
      <span class="font-bold text-green">{{ filteredItems.length }}</span>
      resultado{{ filteredItems.length !== 1 ? 's' : '' }}
    </p>

    <!-- Grid de Items Reutilizable -->
    <ItemGrid
      v-if="paginated.length > 0"
      :items="paginated"
      @select="selectedItemId = $event"
    />

    <!-- Estado Vacío Reutilizable -->
    <EmptyState
      v-else
      message="No hay resultados para los filtros seleccionados."
      action-label="Limpiar filtros"
      @action="clearFilters"
    />

    <!-- Paginación Reutilizable -->
    <PaginationBar
      v-model:current-page="currentPage"
      :total-pages="totalPages"
    />

    <!-- Modal de Detalles -->
    <ItemDetailsModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItemId = null"
    />
  </PageContainer>
</template>
