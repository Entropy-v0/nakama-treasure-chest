<script setup lang="ts">
/**
 * App.vue — Refactorizado (Fase 3 & 4: Pinia + Vue Router + Supabase Auth)
 * Layout raíz reactivo al estado de autenticación y rutas activas.
 * Protege estrictamente la visualización de vistas privadas.
 */
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppLayout from './components/layout/AppLayout.vue'
import LoadingScreen from './components/ui/LoadingScreen.vue'
import AlertModal from './components/ui/AlertModal.vue'

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
  <AppLayout v-else-if="authStore.isAuthenticated && !route.meta.guestOnly">
    <RouterView />
  </AppLayout>

  <!-- Vistas públicas de autenticación (Login / Register) -->
  <template v-else>
    <RouterView />
  </template>

  <!-- Modal global para alertas y confirmaciones -->
  <AlertModal />
</template>
