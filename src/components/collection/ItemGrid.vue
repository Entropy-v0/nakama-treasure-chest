<script setup lang="ts">
/**
 * ItemGrid — Dumb Component
 * Cuadrícula responsive unificada para tarjetas de contenido (ItemCard).
 * Centraliza la maquetación de 4 breakpoints y delega el evento select con el ID del ítem.
 */
import type { Item } from '../../types/items'
import ItemCard from './ItemCard.vue'

interface Props {
  items: Item[]
}

defineProps<Props>()

defineEmits<{
  select: [id: number]
}>()
</script>

<template>
  <div
    class="mb-10 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-5 max-lg:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-md:grid-cols-2"
  >
    <ItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      @select="$emit('select', item.id)"
    />
  </div>
</template>

