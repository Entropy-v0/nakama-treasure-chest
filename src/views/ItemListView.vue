<script setup lang="ts">
/**
 * ItemListView.vue — Smart Component
 * Orquesta la visualización de la colección completa.
 * Consume el motor centralizado useItemFilters para búsqueda, filtrado y paginación.
 */
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'
import { useCrewStore } from '../stores/crew'
import { useItemFilters } from '../composables/useItemFilters'
import {
  TYPE_META,
  TYPE_TABS_META,
  STATUS_COLORS,
  TIPOS_FILTER,
  ESTADOS_FILTER,
} from '../composables/useTypeMeta'

import PageContainer from '../components/layout/PageContainer.vue'
import SearchBar from '../components/collection/SearchBar.vue'
import FilterTabs, { type FilterTabItem } from '../components/collection/FilterTabs.vue'
import StatusFilter from '../components/collection/StatusFilter.vue'
import ItemCard from '../components/collection/ItemCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import ScopeFilter from '../components/ui/ScopeFilter.vue'
import ItemDetailsModal from '../components/ItemDetailsModal.vue'

const itemsStore = useItemsStore()
const crewStore = useCrewStore()

const { items, isLoading, isLoaded } = storeToRefs(itemsStore)
const { hasCrew } = storeToRefs(crewStore)

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
} = useItemFilters(items, { hasCrew, itemsPerPage: 18 })

const selectedItemId = ref<number | null>(null)
const selectedItem = computed(() => {
  if (selectedItemId.value === null) return null
  return items.value.find(i => i.id === selectedItemId.value) || null
})

onMounted(async () => {
  crewStore.loadCrewData()
  if (!isLoaded.value) {
    try {
      await itemsStore.loadItems()
    } catch (e) {
      console.warn('[ItemListView] Error cargando items:', e)
    }
  }
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
        :estados="ESTADOS_FILTER"
        :active="activeEstado"
        :status-colors="STATUS_COLORS"
        @select="setEstado"
      />
    </div>

    <!-- Contador de resultados -->
    <p class="mb-5 text-[13px] text-text-muted">
      <span class="font-bold text-green">{{ filteredItems.length }}</span>
      resultado{{ filteredItems.length !== 1 ? 's' : '' }}
    </p>

    <!-- Grid de Items -->
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

    <!-- Estado Vacío Reutilizable -->
    <EmptyState
      v-else
      message="No hay resultados para los filtros seleccionados."
      action-label="Limpiar filtros"
      @action="clearFilters"
    />

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
