<script setup lang="ts">
/**
 * MobileHeader.vue — Barra superior móvil para Nakama
 * Muestra el logo/marca y el acceso directo al perfil del usuario en pantallas móviles.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import katanaLogo from '../../assets/katana_logo.png'
import { User, Pencil, LogOut, X } from '@lucide/vue'
import EditProfileModal from '../auth/EditProfileModal.vue'

interface Props {
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
})

const router = useRouter()
const authStore = useAuthStore()

const isProfileSheetOpen = ref(false)
const isEditProfileOpen = ref(false)

const openEditProfile = () => {
  isProfileSheetOpen.value = false
  isEditProfileOpen.value = true
}

const handleLogout = async () => {
  isProfileSheetOpen.value = false
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  }
}
</script>

<template>
  <!-- Barra superior (solo en móviles: md:hidden) con transición suave al hacer scroll -->
  <header
    class="hidden h-14 w-full shrink-0 items-center justify-between border-b border-white/5 bg-bg-surface/95 px-4 z-30 backdrop-blur-md max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:flex transition-transform duration-300 ease-in-out"
    :class="{
      'max-md:-translate-y-full': !isVisible,
      'max-md:translate-y-0': isVisible,
    }"
  >
    <!-- Marca / Logo -->
    <div class="flex items-center gap-2.5">
      <img :src="katanaLogo" alt="Nakama Logo" class="size-8 object-contain [filter:brightness(0)_invert(1)]" />
      <span class="font-heading text-lg font-bold tracking-tight text-text-primary">Nakama</span>
    </div>

    <!-- Botón de Avatar de Usuario -->
    <button
      type="button"
      class="relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--zoro-green-border)] bg-bg-elevated shadow-sm transition-all duration-200 hover:border-green-light active:scale-95"
      title="Mi perfil"
      @click="isProfileSheetOpen = true"
    >
      <img
        v-if="authStore.avatarUrl"
        :src="authStore.avatarUrl"
        :alt="authStore.userName"
        class="h-full w-full object-cover"
      />
      <User v-else :size="16" class="text-green" />
    </button>
  </header>

  <!-- Sheet / Modal de Perfil en Móvil -->
  <div
    v-if="isProfileSheetOpen"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
    @click.self="isProfileSheetOpen = false"
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
        @click="isProfileSheetOpen = false"
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
