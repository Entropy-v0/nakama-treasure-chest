<script setup lang="ts">
/**
 * CalendarView.vue — Vista de Calendario para seguimiento de emisiones y lanzamientos.
 */
import PageContainer from '../components/layout/PageContainer.vue'
import { Calendar as CalendarIcon, Clock, Sparkles } from '@lucide/vue'
</script>

<template>
  <PageContainer
    title="Calendario de Emisiones"
    subtitle="Lanzamientos y capitulos semanales"
  >

    <template #header-actions>
      <div class="flex items-center gap-2 rounded-full border border-green/20 bg-green/5 px-3 py-1 text-xs text-green">
        <Sparkles :size="14" />
        <span>En Desarrollo</span>
      </div>
    </template>

    <!-- Contenido en construcción -->
    <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-bg-card/40 p-12 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated text-text-muted">
        <Clock :size="32" class="text-green" />
      </div>
      <h3 class="mb-2 text-lg font-bold text-white">Módulo de Calendario</h3>
      <p class="max-w-md text-sm text-text-muted">
        Esta sección te permitirá llevar el control de los días de estreno semanal de tus animes, mangas y series favoritos.
      </p>
    </div>
  </PageContainer>
</template>
