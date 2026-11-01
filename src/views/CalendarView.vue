<script setup lang="ts">
/**
 * CalendarView.vue — Smart View
 * Consume useCollectionData (datos + carga) y el motor centralizado useItemFilters.
 * Cero intermediarios innecesarios.
 */
import { ref, computed } from 'vue'
import { useCollectionData } from '../composables/useCollectionData'
import { useItemFilters, getDiaActual } from '../composables/useItemFilters'
import type { Item } from '../types/items'

import PageContainer from '../components/layout/PageContainer.vue'
import SearchBar from '../components/collection/SearchBar.vue'
import ScopeFilter from '../components/ui/ScopeFilter.vue'
import DayFilter from '../components/calendar/DayFilter.vue'
import ItemGrid from '../components/collection/ItemGrid.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import ItemDetailsModal from '../components/items/ItemDetailsModal.vue'

// Datos + carga inicial centralizada
const { items, isLoading, hasCrew } = useCollectionData('CalendarView')

const diaDeHoy = getDiaActual()
const selectedItemId = ref<number | null>(null)

// Motor centralizado de filtrado con regla de emisiones
const {
  filteredItems: broadcastItems,
  activeDia,
  activeScope,
  searchQuery,
  conteoPorDia,
  diasList,
  labels,
  setDia,
} = useItemFilters(items, {
  hasCrew,
  initialFilters: {
    estado: 'Viendo',
    diaSemana: diaDeHoy,
    soloConDia: true,
  },
})

const selectedItem = computed<Item | null>(() => {
  if (selectedItemId.value === null) return null
  return items.value.find(i => i.id === selectedItemId.value) || null
})

const activeDiaLabel = computed(() => labels[activeDia.value] || activeDia.value)
</script>

<template>
  <PageContainer
    title="Calendario Semanal"
    subtitle="Lanzamientos y episodios que estás siguiendo actualmente"
    :loading="isLoading"
  >
    <template #title-suffix>
      <ScopeFilter v-if="hasCrew" v-model="activeScope" />
    </template>

    <template #header-actions>
      <SearchBar v-model="searchQuery" placeholder="Buscar en emisión..." />
    </template>

    <!-- Barra de Días (Dumb Component) -->
    <DayFilter
      :days="diasList"
      :active-day="activeDia"
      :current-day="diaDeHoy"
      :counts="conteoPorDia"
      :labels="labels"
      @select="setDia"
    />

    <!-- Contador de resultados -->
    <p class="mb-5 text-[13px] text-text-muted">
      Mostrando <span class="font-bold text-green">{{ broadcastItems.length }}</span> en emisión
      <span v-if="activeDia !== 'Todos'"> para el <strong class="text-text-primary">{{ activeDiaLabel }}</strong></span>
    </p>

    <!-- Grid de Items Reutilizable -->
    <ItemGrid
      v-if="broadcastItems.length > 0"
      :items="broadcastItems"
      @select="selectedItemId = $event"
    />

    <!-- Estado Vacío Reutilizable (Dumb Component) -->
    <EmptyState
      v-else
      :message="`Sin emisiones para ${activeDiaLabel}. Solo se muestra contenido en estado 'Viendo' con día asignado.`"
      :action-label="activeDia !== 'Todos' ? 'Ver todos los días' : null"
      @action="setDia('Todos')"
    />

    <!-- Modal de Detalles -->
    <ItemDetailsModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItemId = null"
    />
  </PageContainer>
</template>
