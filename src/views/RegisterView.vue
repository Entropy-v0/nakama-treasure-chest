<script setup lang="ts">
/**
 * RegisterView.vue — Smart View
 * Vista de registro con formulario completo, selección de título y proveedores OAuth.
 * Validación de campos delegada a utils/validators y constantes en authValidation.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAlert } from '../composables/useAlert'
import { REGISTER_SCHEMA, type RegisterField } from '../constants/authValidation'
import { validateForm, hasErrors, type ValidationErrors } from '../utils/validators'
import { Anchor, Swords } from '@lucide/vue'
import fondoRegistro from '../assets/fondo_registro.webp'
import AuthLayout from '../components/auth/AuthLayout.vue'
import AuthBrand from '../components/auth/AuthBrand.vue'
import OAuthButtons from '../components/auth/OAuthButtons.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import FormInput from '../components/ui/FormInput.vue'

const username = ref('')
const email = ref('')
const password = ref('')
const genero = ref<'femenino' | 'masculino'>('femenino')
const errorMessage = ref('')
const errors = ref<ValidationErrors<RegisterField>>({})

const router = useRouter()
const authStore = useAuthStore()
const { showAlert } = useAlert()

const clearErrors = () => {
  errorMessage.value = ''
  errors.value = {}
}

const handleRegister = async () => {
  clearErrors()

  errors.value = validateForm(
    {
      username: username.value,
      email: email.value,
      password: password.value,
    },
    REGISTER_SCHEMA
  )

  if (hasErrors(errors.value)) return

  try {
    await authStore.signUp({
      email: email.value.trim(),
      password: password.value,
      username: username.value.trim(),
      genero: genero.value,
    })
    const title = genero.value === 'masculino' ? 'Capitán' : 'Capitana'
    await showAlert({
      type: 'success',
      title: '¡Bienvenido a bordo!',
      message: `Tu cuenta ha sido creada exitosamente, ${title} ${username.value.trim()}.`,
    })
    router.push('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.'
  }
}
</script>

<template>
  <AuthLayout :bg-image="fondoRegistro">
    <AuthBrand />

    <!-- Botones de inicio rápido OAuth (Google & Discord) -->
    <OAuthButtons
      @start="clearErrors"
      @error="errorMessage = $event"
    />

    <form class="flex flex-col gap-4.5" novalidate @submit.prevent="handleRegister">
      <!-- Mensaje de error si falla el registro -->
      <div
        v-if="errorMessage"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400"
      >
        {{ errorMessage }}
      </div>

      <FormInput
        id="reg-username"
        v-model="username"
        type="text"
        label="Nombre de usuario"
        placeholder="tu_nombre"
        size="lg"
        :error="errors.username"
        required
      />

      <!-- Selector de Género / Título de Capitán(a) -->
      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">
          Título a bordo
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border p-3 font-body text-[13.5px] font-semibold transition-all duration-200"
            :class="genero === 'femenino'
              ? 'border-green-light bg-green-dark/40 text-green shadow-[0_0_12px_rgba(61,122,85,0.2)]'
              : 'border-[var(--border-color)] bg-bg-input text-text-secondary hover:border-white/20 hover:text-text-primary'"
            @click="genero = 'femenino'"
          >
            <Anchor :size="16" stroke-width="2.2" class="shrink-0" />
            <span>Capitana (Mujer)</span>
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border p-3 font-body text-[13.5px] font-semibold transition-all duration-200"
            :class="genero === 'masculino'
              ? 'border-green-light bg-green-dark/40 text-green shadow-[0_0_12px_rgba(61,122,85,0.2)]'
              : 'border-[var(--border-color)] bg-bg-input text-text-secondary hover:border-white/20 hover:text-text-primary'"
            @click="genero = 'masculino'"
          >
            <Swords :size="16" stroke-width="2.2" class="shrink-0" />
            <span>Capitán (Hombre)</span>
          </button>
        </div>
      </div>

      <FormInput
        id="reg-email"
        v-model="email"
        type="email"
        label="Correo electrónico"
        placeholder="tu@email.com"
        size="lg"
        :error="errors.email"
        required
      />

      <FormInput
        id="reg-password"
        v-model="password"
        type="password"
        label="Contraseña"
        placeholder="•••••••• (mínimo 6 caracteres)"
        size="lg"
        :error="errors.password"
        required
      />

      <div class="mt-1 text-center text-[13px] text-text-muted">
        ¿Ya tienes cuenta?
        <a
          href="#"
          class="font-semibold text-green transition-opacity duration-200 hover:opacity-75"
          @click.prevent="router.push('/login')"
        >
          Inicia sesión
        </a>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="authStore.isLoading"
        loading-text="Creando cuenta..."
      >
        Crear cuenta
      </BaseButton>
    </form>
  </AuthLayout>
</template>
