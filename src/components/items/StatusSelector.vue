<script setup>
/**
 * StatusSelector — Dumb Component
 * Selector de estados en forma de píldoras interactivas.
 */
defineProps({
  statuses: { type: Array, required: true },
  statusColors: { type: Object, default: () => ({}) },
})

const model = defineModel({ type: String, required: true })
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="est in statuses"
      :key="est"
      type="button"
      class="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/5 bg-transparent px-3 py-1.5 font-body text-[12.5px] font-medium text-text-muted transition-all duration-200 hover:text-text-secondary"
      :class="{
        'border-[var(--sc)] text-[var(--sc)]': model === est,
      }"
      :style="model === est ? { '--sc': statusColors[est] || 'var(--zoro-green)', background: `color-mix(in srgb, ${statusColors[est] || 'var(--zoro-green)'} 12%, transparent)` } : {}"
      @click="model = est"
    >
      <span
        class="size-[7px] shrink-0 rounded-full"
        :style="{ background: statusColors[est] || 'var(--zoro-green)' }"
      />
      {{ est }}
    </button>
  </div>
</template>
