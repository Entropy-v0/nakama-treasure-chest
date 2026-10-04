<script setup>
/**
 * Calendar.vue — Vista de Calendario para seguimiento de emisiones y lanzamientos.
 */
import { ref } from 'vue'
import { Calendar as CalendarIcon, Clock, Sparkles } from '@lucide/vue'

const currentDate = ref(new Date())
</script>

<template>
  <div class="mx-auto max-w-6xl p-6 max-md:p-4">
    <!-- Encabezado -->
    <header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
      <div>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green border border-green/20">
            <CalendarIcon :size="22" />
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-white max-md:text-xl">Calendario de Emisiones</h1>
            <p class="text-xs text-text-muted">Lanzamientos y capítulos de tu colección Nakama</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-full border border-green/20 bg-green/5 px-3 py-1 text-xs text-green">
        <Sparkles :size="14" />
        <span>En Desarrollo</span>
      </div>
    </header>

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
  </div>
</template>

