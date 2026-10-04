<script setup>
/**
 * Login.vue — Refactorizado (Fase 3: Pinia + Router + Supabase Auth)
 * Consume AuthLayout y AuthBrand con integración reactiva al store de sesión.
 * Preserva contratos de eventos: login-success, go-to-register.
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import fondoLogin from '../assets/fondo_login.jpg'
import AuthLayout from '../components/auth/AuthLayout.vue'
import AuthBrand from '../components/auth/AuthBrand.vue'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const emit = defineEmits(['login-success', 'go-to-register'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await authStore.signIn({
      email: email.value.trim(),
      password: password.value,
    })
    emit('login-success')
    const redirectPath = (route?.query?.redirect) || '/dashboard'
    router.push(redirectPath)
  } catch (err) {
    errorMessage.value = err.message || 'Credenciales inválidas. Revisa tu correo y contraseña.'
  }
}

const handleDiscordLogin = async () => {
  errorMessage.value = ''
  try {
    await authStore.signInWithOAuth('discord')
  } catch (err) {
    errorMessage.value = err.message || 'Error al conectar con Discord.'
  }
}

const goToRegister = () => {
  emit('go-to-register')
  router.push('/register')
}
</script>

<template>
  <AuthLayout :bg-image="fondoLogin">
    <AuthBrand />

    <!-- Botón de inicio rápido con Discord -->
    <div class="mb-5 flex flex-col gap-3">
      <button
        type="button"
        :disabled="authStore.isLoading"
        class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#5865F2] p-3.5 font-body text-sm font-bold text-white transition-all duration-200 hover:bg-[#4752C4] hover:shadow-[0_0_24px_rgba(88,101,242,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleDiscordLogin"
      >
        <svg class="size-5 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
        <span>Continuar con Discord</span>
      </button>

      <!-- Separador visual -->
      <div class="relative my-1 flex items-center justify-center">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-white/10" />
        </div>
        <span class="relative bg-bg-base px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          o con correo
        </span>
      </div>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
      <!-- Mensaje de error si falla la autenticación -->
      <div
        v-if="errorMessage"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400"
      >
        {{ errorMessage }}
      </div>

      <div class="flex flex-col gap-2">
        <label for="email" class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">
          Correo electrónico
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full rounded-[10px] border border-[var(--border-color)] bg-bg-input px-4 py-3.5 text-[15px] text-text-primary transition-all duration-200 focus:border-white/30 focus:outline-none"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="password" class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary">
          Contraseña
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="w-full rounded-[10px] border border-[var(--border-color)] bg-bg-input px-4 py-3.5 text-[15px] text-text-primary transition-all duration-200 focus:border-white/30 focus:outline-none"
          placeholder="••••••••"
          required
        />
      </div>

      <div class="mt-1 text-center text-[13px] text-text-muted">
        ¿No tienes cuenta?
        <a
          href="#"
          class="font-semibold text-green transition-opacity duration-200 hover:opacity-75"
          @click.prevent="goToRegister"
        >
          Regístrate aquí
        </a>
      </div>

      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-green-light bg-green-dark p-3.5 font-body text-base font-bold text-white transition-all duration-[250ms] ease-out hover:-translate-y-px hover:bg-green-light hover:text-bg-base hover:shadow-[0_0_24px_rgba(61,122,85,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          v-if="authStore.isLoading"
          class="size-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>{{ authStore.isLoading ? 'Iniciando sesión...' : 'Entrar a Nakama' }}</span>
      </button>
    </form>
  </AuthLayout>
</template>
