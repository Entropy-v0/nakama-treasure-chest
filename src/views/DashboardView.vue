<script setup lang="ts">
/**
 * Dashboard.vue — Smart Component (refactorizado)
 * Orquesta los sub-componentes del dashboard.
 * Datos + carga: useCollectionData. Filtrado, orden y conteos: motor centralizado useItemFilters.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Anchor, Users, User, Layers, Dices, Ship, Check, Play, ExternalLink, X, Sparkles } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useCollectionData } from '../composables/useCollectionData'
import { useItemFilters, getRecentItems, getItemsByEstados } from '../composables/useItemFilters'
import { TYPE_META, STATUS_META, TIPOS, ESTADOS_FILTER, ESTADOS_ACTIVOS } from '../constants/itemMeta'
import type { Item } from '../types/items'

import PageContainer from '../components/layout/PageContainer.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import StatusPillBar from '../components/dashboard/StatusPillBar.vue'
import RecentItemCard from '../components/dashboard/RecentItemCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import ScopeFilter from '../components/ui/ScopeFilter.vue'

const emit = defineEmits<{
  'change-view': [viewName?: string]
}>()
const router = useRouter()
const authStore = useAuthStore()

// Datos + carga inicial centralizada
const { items, crew, hasCrew } = useCollectionData('Dashboard')

// Motor centralizado: solo usamos el ámbito y los conteos
const {
  activeScope: currentScope,
  filteredItems: displayItems,
  conteoPorTipo,
  conteoPorEstado,
} = useItemFilters(items, { hasCrew })

const isRandomPickerOpen = ref(false)
const selectedRandomItem = ref<Item | null>(null)
const isSpinning = ref(false)

const goToView = (path: string, viewName?: string) => {
  if (viewName) emit('change-view', viewName)
  router.push(path)
}

const recent = computed(() => getRecentItems(displayItems.value, 6))

const totalItems = computed(() => displayItems.value.length)

const typeCards = computed(() =>
  TIPOS.map(key => ({
    key,
    count: conteoPorTipo.value[key] ?? 0,
    ...TYPE_META[key as keyof typeof TYPE_META],
  }))
)

// Mapa completo (incluye estados con 0) en el orden de ESTADOS_FILTER, sin 'Todos'
const totalByStatus = computed(() =>
  Object.fromEntries(ESTADOS_FILTER.slice(1).map(estado => [estado, conteoPorEstado.value[estado] ?? 0]))
)

</script>

<template>
  <PageContainer>
    <!-- ── Welcome Header ── -->
    <template #header>
      <div>
        <h1 class="mb-1.5 flex items-center gap-2.5 text-[2rem] font-bold text-white max-md:text-2xl">
          {{ authStore.welcomeGreeting }}
          <Anchor class="shrink-0 text-white" :size="28" stroke-width="1.5" />
        </h1>
        <p class="text-[15px] text-text-secondary">
          Tu colección tiene <strong class="font-semibold text-green">{{ totalItems }}</strong> entradas
          <span v-if="hasCrew && currentScope === 'compartido'" class="text-xs text-green ml-1">
            (en común con tu tripulación)
          </span>
        </p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <!-- Botón Agregar contenido -->
        <button
          class="flex items-center gap-2 whitespace-nowrap rounded-lg border border-green-light bg-green-dark px-6 py-3 font-body text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:bg-green-light hover:text-bg-base hover:shadow-[0_0_24px_rgba(61,122,85,0.1)]"
          @click="goToView('/add', 'add')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar contenido
        </button>
      </div>
    </template>

    <!-- ── Selector de Ámbito de Tripulación (Modo Pareja) ── -->
    <div
      v-if="hasCrew"
      class="mb-8 flex items-center justify-between rounded-xl border border-white/5 bg-bg-surface p-2.5 max-md:flex-col max-md:gap-3 max-md:items-stretch"
    >
      <div class="flex items-center gap-2.5 px-3 text-xs text-text-muted">
        <Ship :size="17" class="text-white shrink-0" />
        <span>
          Tripulación activa: <strong class="text-text-primary">{{ crew?.name }}</strong>
        </span>
      </div>

      <ScopeFilter v-model="currentScope" />
    </div>

    <!-- ── Stats: tipos ── -->
    <section class="mb-10">
      <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted">Por tipo</h2>
      <div class="grid grid-cols-5 gap-4 max-xl:grid-cols-3 max-md:grid-cols-2">
        <StatCard
          v-for="card in typeCards"
          :key="card.key"
          :icon="card.icon"
          :count="card.count"
          :label="card.label"
          :color="card.color"
        />
      </div>
    </section>

    <!-- ── Stats: estados ── -->
    <section class="mb-10">
      <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted">Por estado</h2>
      <StatusPillBar :status-counts="totalByStatus" :status-meta="STATUS_META" />
    </section>

    <!-- ── Recientes ── -->
    <section class="mb-10">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-[13px] font-bold uppercase tracking-[2px] text-text-muted">Añadidos recientemente</h2>
        <button
          class="border-none bg-transparent font-body text-[13px] font-semibold text-green cursor-pointer transition-opacity duration-200 hover:opacity-70"
          @click="goToView('/collection', 'list')"
        >
          Ver todo →
        </button>
      </div>

      <div
        v-if="displayItems.length > 0"
        class="grid grid-cols-6 gap-4 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2"
      >
        <RecentItemCard
          v-for="item in recent"
          :key="item.id"
          :item="item"
          :type-meta="TYPE_META[item.tipo] || {}"
          :status-meta="STATUS_META[item.estado] || {}"
        />
      </div>

      <EmptyState
        v-else
        message="No hay contenido en esta vista. ¡Empieza a agregar obras!"
        action-label="Agregar contenido"
        @action="goToView('/add', 'add')"
      />
    </section>

    <!-- ── Modal ¿Qué vemos hoy? (Sorteo Aleatorio) ── -->
    <div
      v-if="isRandomPickerOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
      @click.self="isRandomPickerOpen = false"
    >
      <div
        class="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gold/40 bg-bg-surface shadow-[0_0_50px_rgba(212,175,55,0.25)]"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-border-default px-6 py-4 bg-gold/5">
          <div class="flex items-center gap-2 text-gold">
            <Dices :size="20" />
            <h3 class="text-sm font-bold uppercase tracking-wider">
              ¿Qué vemos hoy?
            </h3>
          </div>
          <button
            type="button"
            class="text-text-muted hover:text-text-primary cursor-pointer"
            @click="isRandomPickerOpen = false"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Spinner o Resultado -->
        <div class="p-6 text-center space-y-4">
          <div v-if="isSpinning" class="py-12 space-y-3">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold animate-bounce">
              <Sparkles :size="32" />
            </div>
            <p class="text-sm font-semibold text-text-primary">
              La ruleta del destino está girando...
            </p>
          </div>

          <div v-else-if="selectedRandomItem" class="space-y-4">
            <!-- Portada -->
            <div class="mx-auto w-36 overflow-hidden rounded-xl border border-gold/40 shadow-xl" style="aspect-ratio: 2/3;">
              <img
                v-if="selectedRandomItem.portada"
                :src="selectedRandomItem.portada"
                :alt="selectedRandomItem.titulo"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-bg-elevated text-gold">
                <Ship :size="32" />
              </div>
            </div>

            <!-- Datos -->
            <div>
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black mb-1.5"
                :style="{ background: STATUS_META[selectedRandomItem.estado]?.color || '#28A745' }"
              >
                {{ selectedRandomItem.tipo }} • {{ selectedRandomItem.estado }}
              </span>
              <h4 class="text-lg font-bold text-text-primary">
                {{ selectedRandomItem.titulo }}
              </h4>
              <p v-if="selectedRandomItem.nota" class="text-xs text-text-muted line-clamp-3 mt-2 leading-relaxed">
                {{ selectedRandomItem.nota }}
              </p>
            </div>
  
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>
