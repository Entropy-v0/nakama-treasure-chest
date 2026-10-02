<script setup>
/**
 * CrewModal.vue — Gestión de Tripulación (Nakama Network / Modo Pareja)
 * Permite crear una tripulación, gestionar miembros, aceptar invitaciones recibidas
 * y enviar invitaciones por correo para compartir la colección.
 */
import { ref, onMounted } from 'vue'
import { useCrew } from '../../composables/useCrew'
import { useAuthStore } from '../../stores/auth'
import { useAlert } from '../../composables/useAlert'
import { 
  X, 
  Users, 
  UserPlus, 
  Mail, 
  Anchor, 
  Swords, 
  Ship, 
  Check, 
  LogOut, 
  Sparkles,
  Heart
} from '@lucide/vue'

const emit = defineEmits(['close'])

const { 
  crew, 
  members, 
  pendingInvites, 
  hasCrew, 
  isCaptain, 
  partner,
  isLoading,
  createCrew,
  sendInvite,
  acceptInvite,
  declineInvite,
  leaveCrew,
  loadCrewData
} = useCrew()

const authStore = useAuthStore()
const { showAlert, showConfirm } = useAlert()

const newCrewName = ref('')
const inviteEmail = ref('')
const isActionLoading = ref(false)

onMounted(async () => {
  await loadCrewData()
})

const handleCreateCrew = async () => {
  if (!newCrewName.value.trim()) {
    await showAlert({
      type: 'info',
      title: 'Nombre requerido',
      message: 'Por favor, escribe un nombre para tu tripulación (ej. "Los Sombrero de Paja").',
    })
    return
  }

  isActionLoading.value = true
  try {
    await createCrew(newCrewName.value.trim())
    await showAlert({
      type: 'success',
      title: '¡Tripulación Creada!',
      message: `Has fundado la tripulación "${newCrewName.value.trim()}". Ahora puedes invitar a tu pareja o nakama.`,
    })
    newCrewName.value = ''
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo crear la tripulación.',
    })
  } finally {
    isActionLoading.value = false
  }
}

const handleSendInvite = async () => {
  const email = inviteEmail.value.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    await showAlert({
      type: 'info',
      title: 'Correo inválido',
      message: 'Introduce un correo electrónico válido para enviar la invitación.',
    })
    return
  }

  if (email === authStore.userEmail.toLowerCase()) {
    await showAlert({
      type: 'info',
      title: 'Aviso',
      message: 'No puedes enviarte una invitación a ti mismo.',
    })
    return
  }

  isActionLoading.value = true
  try {
    await sendInvite(email)
    await showAlert({
      type: 'success',
      title: '¡Invitación Enviada!',
      message: `Hemos registrado la invitación para ${email}. Cuando inicie sesión, podrá unirse a tu tripulación con un solo clic.`,
    })
    inviteEmail.value = ''
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error al invitar',
      message: err.message || 'No se pudo enviar la invitación.',
    })
  } finally {
    isActionLoading.value = false
  }
}

const handleAcceptInvite = async (invite) => {
  isActionLoading.value = true
  try {
    await acceptInvite(invite)
    await showAlert({
      type: 'success',
      title: '¡Bienvenido a Bordo!',
      message: `Te has unido exitosamente a la tripulación "${invite.crew?.name || 'Nakama'}". ¡Ahora comparten biblioteca!`,
    })
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo aceptar la invitación.',
    })
  } finally {
    isActionLoading.value = false
  }
}

const handleDeclineInvite = async (inviteId) => {
  try {
    await declineInvite(inviteId)
  } catch (err) {
    console.error('Error al rechazar:', err)
  }
}

const handleLeaveCrew = async () => {
  const confirmed = await showConfirm({
    title: '¿Abandonar Tripulación?',
    message: 'Si abandonas la tripulación, dejarás de ver las obras compartidas en común.',
    confirmText: 'Sí, abandonar',
    cancelText: 'Cancelar',
    type: 'warning',
  })

  if (!confirmed) return

  isActionLoading.value = true
  try {
    await leaveCrew()
    await showAlert({
      type: 'info',
      title: 'Tripulación abandonada',
      message: 'Has salido de la tripulación. Tus obras personales permanecen intactas.',
    })
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo abandonar la tripulación.',
    })
  } finally {
    isActionLoading.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div
      class="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border-default px-6 py-4 bg-bg-elevated/40">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-green/10 text-green border border-green/20">
            <Users :size="20" />
          </div>
          <div>
            <h2 class="text-base font-bold text-text-primary">
              {{ hasCrew ? crew.name : 'Mi Tripulación' }}
            </h2>
            <p class="text-xs text-text-muted">
              {{ hasCrew ? 'Espacio compartido de visualización' : 'Gestiona y comparte lo que ves en pareja' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
          @click="emit('close')"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Content Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">

        <!-- INVITACIONES PENDIENTES RECIBIDAS -->
        <div v-if="pendingInvites.length > 0" class="space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green">
            <Sparkles :size="14" />
            <span>Invitaciones Recibidas</span>
          </div>

          <div
            v-for="inv in pendingInvites"
            :key="inv.id"
            class="flex flex-col gap-3 rounded-xl border border-green/30 bg-green/5 p-4"
          >
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green/20 text-green">
                <Ship :size="20" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-text-primary">
                  ¡Te han invitado a bordo!
                </p>
                <p class="text-xs text-text-secondary mt-0.5">
                  El Capitán <span class="font-bold text-green">{{ inv.inviter_profile?.username || 'de la tripulación' }}</span> te invita a unirte a <span class="font-bold text-text-primary">"{{ inv.crew?.name || 'su tripulación' }}"</span>.
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-green/15">
              <button
                type="button"
                class="px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                :disabled="isActionLoading"
                @click="handleDeclineInvite(inv.id)"
              >
                Rechazar
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green text-black text-xs font-bold hover:brightness-110 cursor-pointer transition-all shadow-[0_2px_10px_rgba(40,167,69,0.3)]"
                :disabled="isActionLoading"
                @click="handleAcceptInvite(inv)"
              >
                <Check :size="14" />
                <span>Aceptar a Bordo</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ESTADO 1: NO TIENE TRIPULACIÓN -->
        <div v-if="!hasCrew" class="space-y-5">
          <div class="rounded-xl border border-border-default bg-bg-elevated/30 p-5 text-center space-y-3">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/20">
              <Heart :size="28" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-text-primary">
                Modo Pareja & Tripulación
              </h3>
              <p class="text-xs text-text-muted max-w-sm mx-auto mt-1 leading-relaxed">
                Crea una tripulación para compartir una biblioteca común con tu pareja. Podrán marcar qué ver juntos, ver quién recomendó cada serie y sortear la película de hoy.
              </p>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Nombre de tu Tripulación
            </label>
            <div class="flex gap-2">
              <input
                v-model="newCrewName"
                type="text"
                placeholder="Ej. Los Sombrero de Paja"
                class="flex-1 rounded-xl border border-border-default bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-green focus:outline-none focus:ring-1 focus:ring-green transition-all"
                :disabled="isActionLoading"
                @keyup.enter="handleCreateCrew"
              />
              <button
                type="button"
                class="flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-xs font-bold text-black hover:brightness-110 cursor-pointer transition-all disabled:opacity-50 shadow-[0_2px_12px_rgba(40,167,69,0.3)]"
                :disabled="isActionLoading || !newCrewName.trim()"
                @click="handleCreateCrew"
              >
                <Anchor :size="15" />
                <span>Fundar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ESTADO 2: YA TIENE TRIPULACIÓN ACTIVA -->
        <div v-else class="space-y-6">

          <!-- Miembros a Bordo -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Miembros a Bordo ({{ members.length }})
              </span>
              <span class="text-[11px] text-green font-semibold flex items-center gap-1">
                <Ship :size="12" />
                <span>Navegando juntos</span>
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="m in members"
                :key="m.id"
                class="flex items-center justify-between rounded-xl border border-border-default bg-bg-elevated/40 p-3.5"
              >
                <div class="flex items-center gap-3">
                  <!-- Avatar -->
                  <div class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-default bg-bg-elevated">
                    <img
                      v-if="m.profile?.avatar_url"
                      :src="m.profile.avatar_url"
                      :alt="m.profile?.username || 'Nakama'"
                      class="h-full w-full object-cover"
                    />
                    <Anchor v-else :size="18" class="text-text-muted" />
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-text-primary">
                        {{ m.profile?.username || 'Nakama' }}
                      </span>
                      <span
                        v-if="m.user_id === authStore.user?.id"
                        class="rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] font-bold text-text-muted uppercase"
                      >
                        Tú
                      </span>
                    </div>
                    <p class="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <component :is="m.profile?.genero === 'masculino' ? Anchor : Swords" :size="11" class="text-green" />
                      <span>{{ m.role === 'capitan' ? (m.profile?.genero === 'masculino' ? 'Capitán' : 'Capitana') : 'Nakama a Bordo' }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enviar Invitación -->
          <div class="space-y-3 rounded-xl border border-border-default bg-bg-elevated/20 p-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
              <UserPlus :size="14" class="text-green" />
              <span>Invitar a tu Pareja o Nakama</span>
            </div>
            <p class="text-xs text-text-muted leading-relaxed">
              Introduce el correo electrónico con el que tu pareja tiene (o creará) su cuenta.
            </p>

            <div class="flex gap-2 pt-1">
              <div class="relative flex-1">
                <Mail :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  v-model="inviteEmail"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  class="w-full rounded-xl border border-border-default bg-bg-surface pl-9 pr-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-green focus:outline-none focus:ring-1 focus:ring-green transition-all"
                  :disabled="isActionLoading"
                  @keyup.enter="handleSendInvite"
                />
              </div>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-xl bg-bg-elevated border border-border-default hover:border-green hover:text-green px-4 py-2.5 text-xs font-bold text-text-primary cursor-pointer transition-all disabled:opacity-50"
                :disabled="isActionLoading || !inviteEmail.trim()"
                @click="handleSendInvite"
              >
                <UserPlus :size="14" />
                <span>Invitar</span>
              </button>
            </div>
          </div>

          <!-- Zona de peligro / Abandonar -->
          <div class="pt-2 border-t border-border-default flex items-center justify-between">
            <span class="text-xs text-text-muted">
              ¿Deseas desvincularte?
            </span>
            <button
              type="button"
              class="flex items-center gap-1.5 text-xs font-semibold text-state-dropped hover:underline cursor-pointer transition-colors"
              :disabled="isActionLoading"
              @click="handleLeaveCrew"
            >
              <LogOut :size="13" />
              <span>Abandonar Tripulación</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end border-t border-border-default px-6 py-3.5 bg-bg-elevated/40">
        <button
          type="button"
          class="rounded-xl border border-border-default bg-bg-elevated px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary cursor-pointer"
          @click="emit('close')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
