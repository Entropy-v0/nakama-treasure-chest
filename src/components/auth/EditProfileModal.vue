<script setup lang="ts">
/**
 * EditProfileModal.vue — Dumb/Smart Component Híbrido
 * Permite al usuario editar su nombre, enlace de avatar y género/título a bordo.
 * Se sincroniza reactivamente con Pinia useAuthStore y Supabase.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAlert } from '../../composables/useAlert'
import { X, Check, Camera, User, Anchor, Swords, Trash2 } from '@lucide/vue'
import BaseButton from '../ui/BaseButton.vue'
import FormInput from '../ui/FormInput.vue'

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const authStore = useAuthStore()
const { showAlert, showConfirm } = useAlert()

interface FormState {
  username: string
  avatar_url: string
  genero: 'femenino' | 'masculino'
}

const form = ref<FormState>({
  username: authStore.userName || '',
  avatar_url: authStore.avatarUrl || '',
  genero: (authStore.userGenero as 'femenino' | 'masculino') || 'femenino',
})

const isSubmitting = ref(false)
const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}

const handleImageUrlChange = () => {
  imageError.value = false
}

const handleSave = async () => {
  if (!form.value.username.trim()) {
    await showAlert({
      type: 'info',
      title: 'Campo requerido',
      message: 'El nombre de usuario no puede estar vacío.',
    })
    return
  }

  isSubmitting.value = true
  try {
    await authStore.updateProfile({
      username: form.value.username.trim(),
      avatar_url: form.value.avatar_url.trim() || undefined,
      genero: form.value.genero,
    })

    await showAlert({
      type: 'success',
      title: '¡Perfil actualizado!',
      message: `Tus cambios han sido guardados, ${authStore.userTitle} ${authStore.userName}.`,
    })

    emit('close')
  } catch (err: any) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err?.message || 'No se pudo actualizar el perfil.',
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteAccount = async () => {
  const confirmed = await showConfirm({
    title: '¿Eliminar cuenta permanentemente?',
    message: 'Esta acción no se puede deshacer. Se borrarán tus datos, obras personales y membresía en la tripulación.',
    confirmText: 'Eliminar definitivamente',
  })
  if (!confirmed) return

  isSubmitting.value = true
  try {
    await authStore.deleteAccount()
    emit('close')
    router.push('/login')
    await showAlert({
      type: 'info',
      title: 'Cuenta eliminada',
      message: 'Tu cuenta y perfil han sido eliminados correctamente.',
    })
  } catch (err: any) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err?.message || 'No se pudo eliminar la cuenta.',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-6 backdrop-blur-md max-md:p-4"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-[480px] overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-bg-surface p-7 shadow-[0_20px_48px_rgba(0,0,0,0.7),var(--shadow-glow)] max-md:p-5">

      <!-- Top accent line -->
      <div class="absolute top-0 right-0 left-0 h-[3px] bg-green" />

      <!-- Botón de Cerrar -->
      <button
        class="absolute top-4 right-4 flex size-[34px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-bg-elevated text-text-secondary transition-colors duration-200 hover:border-state-dropped hover:text-state-dropped"
        title="Cerrar"
        @click="$emit('close')"
      >
        <X :size="18" stroke-width="2.5" />
      </button>

      <!-- Encabezado -->
      <div class="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
        <div class="flex size-10 items-center justify-center rounded-xl border border-[var(--zoro-green-border)] bg-bg-elevated text-green">
          <Anchor :size="20" stroke-width="2" />
        </div>
        <div>
          <h2 class="font-heading text-lg font-bold text-text-primary">Editar perfil</h2>
          <p class="text-xs text-text-muted">Personaliza tus datos de tripulante</p>
        </div>
      </div>

      <form class="flex flex-col gap-5" @submit.prevent="handleSave">

        <!-- Vista previa y URL de Avatar -->
        <div class="flex flex-col items-center gap-3">
          <div class="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--zoro-green-border)] bg-bg-elevated shadow-md">
            <img
              v-if="form.avatar_url && !imageError"
              :src="form.avatar_url"
              alt="Avatar"
              class="h-full w-full object-cover"
              @error="handleImageError"
            />
            <div v-else class="flex flex-col items-center justify-center text-green-light">
              <User :size="32" stroke-width="1.5" />
            </div>
            <div class="pointer-events-none absolute inset-0 rounded-full border border-white/10" />
          </div>
          <span class="text-[11px] font-semibold text-text-muted">Vista previa del avatar</span>
        </div>

        <!-- Input URL de Avatar -->
        <FormInput
          v-model="form.avatar_url"
          type="url"
          label="URL de imagen de avatar"
          placeholder="https://ejemplo.com/tu-foto.jpg"
          @input="handleImageUrlChange"
        >
          <template #leading>
            <Camera :size="14" />
          </template>
        </FormInput>

        <!-- Nombre de usuario -->
        <FormInput
          v-model="form.username"
          type="text"
          label="Nombre de usuario"
          placeholder="Tu nombre de usuario"
          required
        >
          <template #leading>
            <User :size="14" />
          </template>
        </FormInput>

        <!-- Selector de Género / Título -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Título a bordo
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-2.5 font-body text-xs font-bold transition-all duration-200"
              :class="form.genero === 'femenino'
                ? 'border-green-light bg-green-dark/40 text-green shadow-[0_0_12px_rgba(61,122,85,0.2)]'
                : 'border-[var(--border-color)] bg-bg-input text-text-secondary hover:border-white/20 hover:text-text-primary'"
              @click="form.genero = 'femenino'"
            >
              <Anchor :size="15" stroke-width="2.2" class="shrink-0" />
              <span>Capitana (Mujer)</span>
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-2.5 font-body text-xs font-bold transition-all duration-200"
              :class="form.genero === 'masculino'
                ? 'border-green-light bg-green-dark/40 text-green shadow-[0_0_12px_rgba(61,122,85,0.2)]'
                : 'border-[var(--border-color)] bg-bg-input text-text-secondary hover:border-white/20 hover:text-text-primary'"
              @click="form.genero = 'masculino'"
            >
              <Swords :size="15" stroke-width="2.2" class="shrink-0" />
              <span>Capitán (Hombre)</span>
            </button>
          </div>
        </div>

        <!-- Zona de Peligro / Eliminar Cuenta -->
        <div class="mt-1 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-red-400">Eliminar cuenta</h4>
            <p class="text-[11px] text-text-muted">Borra permanentemente tu perfil y todos tus datos.</p>
          </div>
          <BaseButton
            variant="danger"
            size="sm"
            :disabled="isSubmitting"
            @click="handleDeleteAccount"
          >
            <template #icon-left>
              <Trash2 :size="13" />
            </template>
            Eliminar
          </BaseButton>
        </div>

        <!-- Botones de Acción -->
        <div class="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-white/5">
          <BaseButton
            variant="secondary"
            size="md"
            @click="$emit('close')"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            size="md"
            :loading="isSubmitting"
            loading-text="Guardando..."
          >
            <template #icon-left>
              <Check :size="15" stroke-width="2.5" />
            </template>
            Guardar cambios
          </BaseButton>
        </div>

      </form>
    </div>
  </div>
</template>
