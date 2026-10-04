<script setup lang="ts">
/**
 * ScoreSelector — Dumb Component
 * Botones numéricos del 1 al 10 para calificar contenido (permite deseleccionar).
 */
interface Props {
  options?: number[]
}

withDefaults(defineProps<Props>(), {
  options: () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
})

const model = defineModel<number | null>({ default: null })

const toggleScore = (n: number) => {
  model.value = model.value === n ? null : n
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="n in options"
      :key="n"
      type="button"
      class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-card font-heading text-sm font-bold text-text-muted transition-all duration-200 hover:border-gold hover:text-gold"
      :class="{
        '!border-gold !bg-gold !text-black': model === n,
      }"
      @click="toggleScore(n)"
    >
      {{ n }}
    </button>
  </div>
</template>
