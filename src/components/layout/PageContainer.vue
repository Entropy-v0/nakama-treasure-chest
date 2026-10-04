<script setup lang="ts">
/**
 * PageContainer.vue — Contenedor estándar para vistas de página (Layout Window Standard)
 * Estandariza el espaciado responsive, estructura de encabezado y adaptabilidad de la ventana.
 */
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    maxWidth?: string
  }>(),
  {
    title: '',
    subtitle: '',
    maxWidth: '',
  }
)
</script>

<template>
  <div
    class="box-border min-h-screen px-10 py-8 max-md:px-4 max-md:py-6"
    :class="maxWidth"
  >
    <!-- Encabezado de página estandarizado -->
    <header
      v-if="title || $slots.header || $slots['header-actions']"
      class="mb-8 flex items-center justify-between border-b border-white/5 pb-5 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <slot name="header">
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <slot name="title-prefix" />
            <h1 class="font-heading text-[2rem] font-bold text-white max-md:text-xl">
              {{ title }}
            </h1>
            <slot name="title-suffix" />
          </div>
          <p v-if="subtitle" class="mt-1 text-sm text-text-muted">
            {{ subtitle }}
          </p>
        </div>
      </slot>

      <!-- Ranura para acciones a la derecha (Buscador, botones, selectores de ámbito) -->
      <div v-if="$slots['header-actions']" class="flex items-center gap-3 flex-wrap max-md:w-full max-md:justify-between">
        <slot name="header-actions" />
      </div>
    </header>

    <!-- Contenido principal de la página -->
    <slot />
  </div>
</template>
