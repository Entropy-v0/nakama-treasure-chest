<script setup>
/**
 * StatCard — Dumb Component
 * Tarjeta individual de estadística para el dashboard.
 * Recibe todos los datos vía props, no maneja estado.
 */
defineProps({
  icon: { type: [Object, Function], required: true },
  count: { type: Number, required: true },
  label: { type: String, required: true },
  color: { type: String, default: 'var(--text-muted)' },
})
</script>

<template>
  <div
    class="group relative flex cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-[14px] border border-white/5 bg-bg-card px-5 py-6 transition-all duration-[250ms] ease-out hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    :style="{ '--card-color': color }"
  >
    <!-- Top accent line -->
    <div
      class="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]"
      :style="{ background: color }"
    />

    <component :is="icon" class="size-7" :style="{ color }" stroke-width="1.5" />
    <span
      class="font-heading text-4xl font-bold leading-none"
      :style="{ color }"
    >
      {{ count }}
    </span>
    <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">
      {{ label }}s
    </span>
  </div>
</template>
