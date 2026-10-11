<script setup lang="ts">
/**
 * AlertModal.vue — Global Feedback UI Primitive
 * Modal global para confirmaciones y alertas de la aplicación.
 * Muestra el botón Cancelar estrictamente cuando isConfirm es true.
 */
import { useAlert } from '../../composables/useAlert'
import BaseButton from './BaseButton.vue'

const { state, confirm, cancel } = useAlert()
</script>

<template>
  <div
    v-if="state.isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
    @click.self="cancel"
  >
    <div class="relative flex w-[90%] max-w-[460px] flex-col items-center overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-bg-surface p-9 shadow-[0_20px_48px_rgba(0,0,0,0.7),var(--shadow-glow)] before:absolute before:top-0 before:right-0 before:left-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-green before:to-transparent">
      <!-- Header / Icon & Title -->
      <div class="flex w-full items-center justify-center gap-4">
        <!-- Error Icon -->
        <div v-if="state.type === 'error'" class="flex size-11 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-bg-elevated text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <!-- Warning Icon -->
        <div v-else-if="state.type === 'warning'" class="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--zoro-green-border)] bg-bg-elevated text-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <!-- Info Icon -->
        <div v-else-if="state.type === 'info'" class="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--zoro-green-border)] bg-bg-elevated text-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>

        <!-- Success Icon -->
        <div v-else-if="state.type === 'success'" class="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--zoro-green-border)] bg-bg-elevated text-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 class="font-heading text-2xl font-bold text-text-primary">{{ state.title }}</h2>
      </div>

      <!-- Decorative Line -->
      <div class="my-4 mb-6 flex w-full justify-center">
        <svg class="h-5 w-full max-w-[380px]" viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <line x1="10" y1="10" x2="190" y2="10" stroke="var(--text-secondary)" stroke-width="2" />
          <polygon points="30,8 35,10 30,12 25,10" fill="var(--text-secondary)" />
          <polygon points="170,8 175,10 170,12 165,10" fill="var(--text-secondary)" />
          <polygon points="200,4 206,10 200,16 194,10" fill="var(--text-secondary)" />
          <line x1="210" y1="10" x2="390" y2="10" stroke="var(--text-secondary)" stroke-width="2" />
          <polygon points="230,8 235,10 230,12 225,10" fill="var(--text-secondary)" />
          <polygon points="370,8 375,10 370,12 365,10" fill="var(--text-secondary)" />
        </svg>
      </div>

      <!-- Message -->
      <div class="mb-7 px-3 text-center">
        <p class="font-body text-base font-normal leading-relaxed text-text-secondary">{{ state.message }}</p>
      </div>

      <!-- Actions -->
      <div class="flex w-full justify-center gap-3">
        <BaseButton
          v-if="state.isConfirm"
          variant="secondary"
          size="md"
          block
          @click="cancel"
        >
          {{ state.cancelText || 'Cancelar' }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="md"
          block
          @click="confirm"
        >
          {{ state.confirmText || 'Aceptar' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

