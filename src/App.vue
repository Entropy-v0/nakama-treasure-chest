<script setup lang="ts">
/**
 * App.vue — Refactorizado (Fase 3 & 4: Pinia + Vue Router + Supabase Auth)
 * Layout raíz reactivo al estado de autenticación y rutas activas.
 * Protege estrictamente la visualización de vistas privadas.
 */
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Sidebar from './components/Sidebar.vue'
import MobileHeader from './components/layout/MobileHeader.vue'
import LoadingScreen from './components/ui/LoadingScreen.vue'
import AlertModal from './components/AlertModal.vue'

const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
})
</script>

<template>
  <!-- Pantalla de carga mientras se inicializa y valida la sesión -->
  <LoadingScreen v-if="!authStore.isInitialized" />

  <!-- Layout protegido: Solo accesible cuando la sesión está verificada y no es ruta guest -->
  <div
    v-else-if="authStore.isAuthenticated && !route.meta.guestOnly"
    class="flex h-screen w-screen flex-col overflow-hidden bg-bg-base"
  >
    <!-- Cabecera superior móvil (marca y perfil) -->
    <MobileHeader />

    <div class="flex flex-1 overflow-hidden max-md:flex-col-reverse">
      <Sidebar />
      <main class="flex-1 overflow-y-auto bg-bg-base">
        <RouterView />
      </main>
    </div>
  </div>

  <!-- Vistas públicas de autenticación (Login / Register) -->
  <template v-else>
    <RouterView />
  </template>

  <!-- Modal global para alertas y confirmaciones -->
  <AlertModal />
</template>
