<script setup lang="ts">
/**
 * AppLayout.vue — Layout Principal Autenticado (Layout Standard)
 * Estructura de la aplicación privada:
 * - Cabecera móvil (MobileHeader): fixed superior, se oculta suavemente al hacer scroll hacia abajo y reaparece al subir.
 * - Barra lateral / inferior (Sidebar): fija a la izquierda en escritorio, fija al fondo en móvil.
 * - Área de contenido (<main>): scroll vertical independiente con márgenes seguros en móvil para no tapar contenido.
 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import MobileHeader from './MobileHeader.vue'

const route = useRoute()
const isHeaderVisible = ref(true)
const mainRef = ref<HTMLElement | null>(null)

let lastScrollY = 0
const SCROLL_THRESHOLD = 8 // Filtra micro-vibraciones del dedo

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target) return
  const currentScrollY = target.scrollTop

  // Si estamos en la parte superior, mantener siempre visible el header
  if (currentScrollY <= 15) {
    isHeaderVisible.value = true
    lastScrollY = currentScrollY
    return
  }

  const diff = currentScrollY - lastScrollY
  if (Math.abs(diff) < SCROLL_THRESHOLD) return

  // diff > 0: usuario desliza hacia abajo (scroll down) -> ocultar header
  // diff < 0: usuario desliza hacia arriba (scroll up) -> mostrar header
  isHeaderVisible.value = diff < 0
  lastScrollY = currentScrollY
}

// Al navegar a otra vista, reiniciar posición de scroll y mostrar header
watch(
  () => route.fullPath,
  () => {
    isHeaderVisible.value = true
    lastScrollY = 0
    if (mainRef.value) {
      mainRef.value.scrollTop = 0
    }
  }
)
</script>

<template>
  <div class="relative flex h-screen w-screen overflow-hidden bg-bg-base">
    <!-- Cabecera superior móvil (fixed en max-md, hidden en md+) -->
    <MobileHeader :is-visible="isHeaderVisible" />

    <!-- Barra lateral de navegación (escritorio: izquierda fija, móvil: barra fija inferior) -->
    <Sidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Área de contenido con scroll independiente y padding seguro en móvil -->
      <main
        ref="mainRef"
        class="flex-1 overflow-y-auto bg-bg-base max-md:pt-14 max-md:pb-24 max-md:overscroll-y-contain"
        @scroll="handleScroll"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
