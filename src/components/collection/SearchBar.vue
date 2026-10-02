<script setup>
/**
 * SearchBar — Dumb Component
 * Barra de búsqueda con ícono integrado.
 * Usa v-model para binding bidireccional con el componente padre.
 */
const model = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="relative flex items-center">
    <svg
      class="pointer-events-none absolute left-3.5 text-text-muted"
      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
    >
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      v-model="model"
      type="text"
      placeholder="Buscar..."
      class="w-65 rounded-[10px] border border-[var(--border-color)] bg-bg-input py-2.5 pr-4 pl-10 text-sm text-text-primary max-md:w-full max-md:box-border"
    />
  </div>
</template>
