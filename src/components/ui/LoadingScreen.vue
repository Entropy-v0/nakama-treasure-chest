<script setup lang="ts">
/**
 * LoadingScreen.vue — Dumb Component
 * Spinner / Loader de inicio con branding Nakama y animación suave.
 */
import katanaLogo from '../../assets/katana_logo.png'

interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Cargando tu bitácora...',
})
</script>

<template>
  <div class="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-bg-base">
    <!-- Glow central -->
    <div class="pointer-events-none absolute size-72 rounded-full bg-green/10 blur-[100px]" />

    <div class="relative flex flex-col items-center gap-5">
      <!-- Logo con pulsación suave -->
      <div class="relative flex size-20 items-center justify-center rounded-2xl border border-[var(--zoro-green-border)] bg-bg-surface shadow-[0_0_40px_rgba(61,122,85,0.25)]">
        <img
          :src="katanaLogo"
          alt="Nakama"
          class="size-12 object-contain animate-pulse [filter:brightness(0)_invert(1)]"
        />
        <div class="absolute -inset-1 rounded-2xl border border-green-light/20 animate-ping opacity-30" />
      </div>

      <!-- Spinner y mensaje -->
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <div class="size-2 rounded-full bg-green animate-bounce [animation-delay:-0.3s]" />
          <div class="size-2 rounded-full bg-green animate-bounce [animation-delay:-0.15s]" />
          <div class="size-2 rounded-full bg-green animate-bounce" />
        </div>
        <p class="font-heading text-sm font-semibold tracking-wider text-text-secondary uppercase">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

