<script setup>
/**
 * FilterTabs — Dumb Component
 * Tabs de filtro genéricos. Cada tab tiene un ícono opcional y un label.
 * Emite la selección, no maneja estado interno.
 */
defineProps({
  tabs: {
    type: Array,
    required: true,
    // [{ key: 'Anime', icon: Component, color: '#FFF' }, ...]
  },
  active: { type: String, required: true },
})

defineEmits(['select'])
</script>

<template>
  <div class="flex flex-wrap gap-2 max-md:flex-nowrap max-md:overflow-x-auto max-md:pb-2 max-md:[-webkit-overflow-scrolling:touch]">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="flex items-center gap-[7px] whitespace-nowrap rounded-lg border border-[var(--border-color)] bg-bg-card px-[18px] py-2 font-body text-sm font-medium text-text-muted cursor-pointer transition-all duration-200 hover:border-[var(--zoro-green-border)] hover:text-text-primary"
      :class="{
        'border-[var(--tab-color,var(--zoro-green))] bg-[var(--zoro-green-glow)] font-semibold text-[var(--tab-color,var(--zoro-green))]': active === tab.key
      }"
      :style="active === tab.key ? { '--tab-color': tab.color || 'var(--zoro-green)' } : {}"
      @click="$emit('select', tab.key)"
    >
      <component
        v-if="tab.icon"
        :is="tab.icon"
        :size="15"
        stroke-width="2"
      />
      {{ tab.key }}
    </button>
  </div>
</template>
