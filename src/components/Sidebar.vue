<script setup lang="ts">
/**
 * Sidebar.vue — Refactorizado (Fase 3: Pinia + Vue Router)
 * Barra de navegación lateral de escritorio y barra inferior en móvil.
 * Integrado con useAuthStore para usuario activo y cierre de sesión.
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import katanaLogo from '../assets/katana_logo.png'
import { Heart, LogOut, Pencil, Ship, Calendar as CalendarIcon, User, X } from '@lucide/vue'
import EditProfileModal from './auth/EditProfileModal.vue'
import { useCrew } from '../composables/useCrew'

const isEditProfileOpen = ref(false)
const isMobileProfileSheetOpen = ref(false)
const { hasPendingInvites } = useCrew()

interface Props {
  currentView?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentView: 'dashboard',
})

const emit = defineEmits<{
  'change-view': [viewName: string]
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isViewActive = (path: string, viewName?: string) => {
  if (route?.path) {
    if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
    return route.path === path
  }
  return props.currentView === viewName
}

const navigateTo = (path: string, viewName?: string) => {
  if (viewName) emit('change-view', viewName)
  router.push(path)
}

const openEditProfile = () => {
  isMobileProfileSheetOpen.value = false
  isEditProfileOpen.value = true
}

const handleLogout = async () => {
  isMobileProfileSheetOpen.value = false
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  }
}
</script>

<template>
  <aside class="flex h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-[var(--border-color)] bg-bg-surface p-0 max-md:h-[70px] max-md:w-full max-md:flex-row max-md:items-center max-md:justify-around max-md:border-t max-md:border-r-0 max-md:px-2 max-md:z-40">

    <!-- Brand / Logo (oculto en móvil) -->
    <div class="border-b border-white/5 px-5 pt-6 pb-5 max-md:hidden">
      <div class="flex items-center gap-3">
        <img :src="katanaLogo" alt="Nakama Logo" class="size-11 shrink-0 object-contain [filter:brightness(0)_invert(1)]" />
        <div class="flex flex-col leading-tight">
          <span class="font-heading text-[22px] font-bold tracking-tight text-text-primary">Nakama</span>
          <span class="mt-0.5 text-[11px] font-medium uppercase tracking-[1.5px] text-text-muted">Nada ocurrió</span>
        </div>
      </div>
    </div>

    <!-- User Profile (oculto en móvil) -->
    <div class="flex items-center gap-3 border-b border-white/5 px-5 py-4 max-md:hidden">
      <div
        class="relative flex size-[38px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--zoro-green-border)] bg-bg-elevated shadow-sm transition-colors hover:border-green-light"
        title="Editar perfil"
        @click="isEditProfileOpen = true"
      >
        <img
          v-if="authStore.avatarUrl"
          :src="authStore.avatarUrl"
          :alt="authStore.userName"
          class="h-full w-full object-cover"
        />
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="var(--green-light)">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        <span class="truncate text-sm font-semibold text-text-primary" :title="`${authStore.userTitle} ${authStore.userName}`">
          {{ authStore.userTitle }} {{ authStore.userName }}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1 p-0 text-left text-[11px] text-text-muted no-underline transition-colors duration-200 hover:text-green"
            title="Editar perfil"
            @click="isEditProfileOpen = true"
          >
            <Pencil :size="10.5" />
            <span>Editar</span>
          </button>
          <span class="text-[10px] text-text-muted/40">•</span>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1 p-0 text-left text-[11px] text-text-muted no-underline transition-colors duration-200 hover:text-state-dropped"
            title="Cerrar sesión"
            @click="handleLogout"
          >
            <LogOut :size="10.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-3 max-md:w-full max-md:flex-row max-md:items-center max-md:justify-around max-md:overflow-visible max-md:p-0">

      <!-- Dashboard -->
      <div class="mb-2 max-md:m-0">
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0 max-md:flex-row">
          <li
            class="flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2.25 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary max-md:flex-col max-md:gap-1 max-md:p-2 max-md:text-[10px]"
            :class="{
              'bg-[var(--zoro-green-glow)] font-semibold text-green shadow-[inset_2px_0_0_var(--green)] max-md:bg-transparent max-md:shadow-none': isViewActive('/dashboard', 'dashboard')
            }"
            @click="navigateTo('/dashboard', 'dashboard')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </li>
        </ul>
      </div>

      <!-- Listado -->
      <div class="mb-2 max-md:m-0">
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0 max-md:flex-row">
          <li
            class="flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2.25 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary max-md:flex-col max-md:gap-1 max-md:p-2 max-md:text-[10px]"
            :class="{
              'bg-[var(--zoro-green-glow)] font-semibold text-green shadow-[inset_2px_0_0_var(--green)] max-md:bg-transparent max-md:shadow-none': isViewActive('/collection', 'list')
            }"
            @click="navigateTo('/collection', 'list')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Listado
          </li>
        </ul>
      </div>
      
      <!-- Calendario -->
      <div class="mb-2 max-md:m-0">
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0 max-md:flex-row">
          <li
            class="flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2.25 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary max-md:flex-col max-md:gap-1 max-md:p-2 max-md:text-[10px]"
            :class="{
              'bg-[var(--zoro-green-glow)] font-semibold text-green shadow-[inset_2px_0_0_var(--green)] max-md:bg-transparent max-md:shadow-none': isViewActive('/calendar', 'calendar')
            }"
            @click="navigateTo('/calendar', 'calendar')"
          >
            <CalendarIcon :size="17" class="shrink-0" />
            Calendario
          </li>
        </ul>
      </div>

      <!-- Crew -->
      <div class="mb-2 max-md:m-0">
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0 max-md:flex-row">
          <li
            class="flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-2.25 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary max-md:flex-col max-md:gap-1 max-md:p-2 max-md:text-[10px]"
            :class="{
              'bg-[var(--zoro-green-glow)] font-semibold text-green shadow-[inset_2px_0_0_var(--green)] max-md:bg-transparent max-md:shadow-none': isViewActive('/crew', 'crew')
            }"
            @click="navigateTo('/crew', 'crew')"
          >
            <div class="flex items-center gap-2.5 max-md:flex-col max-md:gap-1">
              <Ship :size="17" class="shrink-0" />
              <span>Tripulación</span>
            </div>
            <span
              v-if="hasPendingInvites"
              class="flex h-2 w-2 rounded-full bg-gold animate-pulse max-md:hidden"
              title="¡Tienes una invitación pendiente!"
            />
          </li>
        </ul>
      </div>

      <!-- Agregar -->
      <div class="mb-2 max-md:m-0">
        <button
          class="my-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--zoro-green-border)] bg-[var(--zoro-green-glow)] px-4 py-2.5 font-body text-[13.5px] font-semibold text-white transition-all duration-200 hover:border-green-light hover:bg-green-dark hover:text-text-primary hover:shadow-[0_0_24px_rgba(61,122,85,0.1)] max-md:m-0 max-md:size-10 max-md:rounded-full max-md:p-0 max-md:text-[0px]"
          title="Agregar contenido"
          @click="navigateTo('/add', 'add')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="shrink-0">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span class="max-md:hidden">Agregar contenido</span>
        </button>
      </div>

      <!-- Perfil (Móvil) -->
      <div class="mb-2 max-md:m-0">
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0 max-md:flex-row">
          <li
            class="hidden cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2.25 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary max-md:flex max-md:flex-col max-md:gap-1 max-md:p-1.5 max-md:text-[10px]"
            :class="{
              'font-semibold text-green': isMobileProfileSheetOpen || isEditProfileOpen
            }"
            title="Mi perfil"
            @click="isMobileProfileSheetOpen = true"
          >
            <div
              class="relative flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full border bg-bg-elevated transition-colors"
              :class="isMobileProfileSheetOpen || isEditProfileOpen ? 'border-green shadow-[0_0_8px_var(--zoro-green-glow)]' : 'border-[var(--zoro-green-border)]'"
            >
              <img
                v-if="authStore.avatarUrl"
                :src="authStore.avatarUrl"
                :alt="authStore.userName"
                class="h-full w-full object-cover"
              />
              <User v-else :size="12" class="text-green" />
            </div>
            <span>Perfil</span>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer (oculto en móvil) -->
    <div class="group border-t border-white/5 p-4 px-5 max-md:hidden">
      <div class="flex items-center justify-center gap-2.5 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
        <Heart :size="20" fill="#FFFFFF" color="#FFFFFF" />
        <span class="text-[13px] font-medium tracking-[0.5px] text-white italic">
          Mi más grande tesoro eres tú
        </span>
      </div>
    </div>
  </aside>

  <!-- Sheet / Modal de Perfil en Móvil -->
  <div
    v-if="isMobileProfileSheetOpen"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
    @click.self="isMobileProfileSheetOpen = false"
  >
    <div class="relative w-full rounded-t-[24px] border-t border-x border-[var(--border-color)] bg-bg-surface p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-200">
      <!-- Top accent line -->
      <div class="absolute top-0 right-0 left-0 h-[3px] rounded-t-[24px] bg-green" />

      <!-- Drag handle -->
      <div class="mx-auto -mt-2 mb-4 h-1 w-10 rounded-full bg-white/20" />

      <!-- Botón de Cerrar -->
      <button
        type="button"
        class="absolute top-4 right-4 flex size-[32px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-elevated text-text-secondary transition-colors duration-200 hover:border-state-dropped hover:text-state-dropped"
        title="Cerrar"
        @click="isMobileProfileSheetOpen = false"
      >
        <X :size="16" stroke-width="2.5" />
      </button>

      <!-- Encabezado de Usuario -->
      <div class="mb-5 flex items-center gap-4 border-b border-white/5 pb-5">
        <div class="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--zoro-green-border)] bg-bg-elevated shadow-md">
          <img
            v-if="authStore.avatarUrl"
            :src="authStore.avatarUrl"
            :alt="authStore.userName"
            class="h-full w-full object-cover"
          />
          <User v-else :size="26" class="text-green" />
        </div>
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="truncate font-heading text-lg font-bold text-text-primary">
            {{ authStore.userTitle }} {{ authStore.userName }}
          </span>
          <span class="truncate text-xs text-text-muted mt-0.5">
            {{ authStore.user?.email || 'Tripulante de Nakama' }}
          </span>
        </div>
      </div>

      <!-- Acciones de Perfil -->
      <div class="flex flex-col gap-3">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[var(--zoro-green-border)] bg-[var(--zoro-green-glow)] py-3 text-sm font-semibold text-text-primary transition-all duration-200 hover:border-green-light hover:bg-green-dark"
          @click="openEditProfile"
        >
          <Pencil :size="16" />
          <span>Editar información del perfil</span>
        </button>

        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-bg-elevated py-3 text-sm font-semibold text-state-dropped transition-colors duration-200 hover:bg-state-dropped/10"
          @click="handleLogout"
        >
          <LogOut :size="16" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Edición de Perfil -->
  <EditProfileModal
    v-if="isEditProfileOpen"
    @close="isEditProfileOpen = false"
  />
</template>
