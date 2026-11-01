<script setup lang="ts">
/**
 * LoginView.vue — Smart View
 * Vista de inicio de sesión con correo/contraseña y proveedores OAuth.
 * Validación de campos delegada a utils/validators y constantes en authValidation.
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LOGIN_SCHEMA, type LoginField } from '../constants/authValidation'
import { validateForm, hasErrors, type ValidationErrors } from '../utils/validators'
import fondoLogin from '../assets/fondo_login.webp'
import AuthLayout from '../components/auth/AuthLayout.vue'
import AuthBrand from '../components/auth/AuthBrand.vue'
import OAuthButtons from '../components/auth/OAuthButtons.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import FormInput from '../components/ui/FormInput.vue'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const errors = ref<ValidationErrors<LoginField>>({})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const clearErrors = () => {
  errorMessage.value = ''
  errors.value = {}
}

const handleLogin = async () => {
  clearErrors()

  errors.value = validateForm(
    {
      email: email.value,
      password: password.value,
    },
    LOGIN_SCHEMA
  )

  if (hasErrors(errors.value)) return

  try {
    await authStore.signIn({
      email: email.value.trim(),
      password: password.value,
    })
    const redirectPath = (route?.query?.redirect as string) || '/dashboard'
    router.push(redirectPath)
  } catch (err: any) {
    errorMessage.value = err.message || 'Credenciales inválidas. Revisa tu correo y contraseña.'
  }
}
</script>

<template>
  <AuthLayout :bg-image="fondoLogin">
    <AuthBrand />

    <!-- Botones de inicio rápido OAuth (Google & Discord) -->
    <OAuthButtons
      @start="clearErrors"
      @error="errorMessage = $event"
    />

    <form class="flex flex-col gap-5" novalidate @submit.prevent="handleLogin">
      <!-- Mensaje de error si falla la autenticación -->
      <div
        v-if="errorMessage"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400"
      >
        {{ errorMessage }}
      </div>

      <FormInput
        id="email"
        v-model="email"
        type="email"
        label="Correo electrónico"
        placeholder="tu@email.com"
        size="lg"
        :error="errors.email"
        required
      />

      <FormInput
        id="password"
        v-model="password"
        type="password"
        label="Contraseña"
        placeholder="••••••••"
        size="lg"
        :error="errors.password"
        required
      />

      <div class="mt-1 text-center text-[13px] text-text-muted">
        ¿No tienes cuenta?
        <a
          href="#"
          class="font-semibold text-green transition-opacity duration-200 hover:opacity-75"
          @click.prevent="router.push('/register')"
        >
          Regístrate aquí
        </a>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="authStore.isLoading"
        loading-text="Iniciando sesión..."
      >
        Entrar a Nakama
      </BaseButton>
    </form>
  </AuthLayout>
</template>
