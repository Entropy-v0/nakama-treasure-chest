<script setup>
/**
 * AuthLayout — Dumb Component
 * Layout compartido de 2 columnas para vistas de autenticación (Login, Registro).
 */
import { Anchor } from '@lucide/vue'

defineProps({
  bgImage: { type: String, required: true },
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-bg-base max-md:flex-col">
    <!-- Panel decorativo izquierdo -->
    <div
      class="relative flex flex-1 items-center justify-center overflow-hidden border-r border-[var(--border-color)] bg-bg-surface bg-cover bg-center max-md:h-[30vh] max-md:min-h-[200px] max-md:flex-none max-md:border-r-0 max-md:border-b"
      :style="{ backgroundImage: `url(${bgImage})` }"
    />

    <!-- Panel derecho con formulario -->
    <div class="flex flex-1 items-center justify-center overflow-y-auto bg-bg-base p-12 max-md:items-start max-md:p-6">
      <div class="flex w-full max-w-[400px] flex-col">
        <slot />

        <!-- Footer común -->
        <p class="mt-10 flex items-center justify-center gap-1 text-center text-[13px] tracking-[0.5px] text-text-muted">
          <Anchor :size="14" stroke-width="1.5" class="text-green" />
          Tu colección te espera
        </p>
      </div>
    </div>
  </div>
</template>
