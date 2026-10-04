<script setup>
/**
 * CrewView.vue — Gestión de Tripulación (Nakama Network / Modo Pareja)
 * Vista con el mismo diseño, estética y estructura visual que el Dashboard y la Colección:
 * - Resumen del barco e información general.
 * - Edición y cambio de nombre de la tripulación.
 * - Lista de miembros a bordo (nakamas).
 * - Invitación de nuevos miembros por correo electrónico.
 * - Aceptar / rechazar invitaciones recibidas.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, 
  UserPlus, 
  Ship, 
  Mail, 
  Send,
  LogOut, 
  Check, 
  X, 
  Pencil,
  Clock,
  ShieldCheck,
  Sparkles,
  User,
  Trash2
} from '@lucide/vue'
import { useCrew } from '../composables/useCrew'
import { useAuthStore } from '../stores/auth'
import { useAlert } from '../composables/useAlert'
import PageContainer from '../components/layout/PageContainer.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showAlert, showConfirm } = useAlert()
const { 
  crew, 
  members, 
  pendingInvites, 
  sentInvites,
  hasCrew, 
  isCaptain,
  memberCount,
  loadCrewData, 
  createCrew, 
  updateCrewName,
  sendInvite, 
  cancelInvite,
  acceptInvite, 
  declineInvite, 
  leaveCrew,
  deleteCrew
} = useCrew()

// Estado local
const newCrewName = ref('')
const inviteEmail = ref('')
const isActionLoading = ref(false)

// Edición de nombre de tripulación
const isEditingName = ref(false)
const editNameInput = ref('')

onMounted(async () => {
  await loadCrewData()
})

const startEditingName = () => {
  editNameInput.value = crew.value?.name || ''
  isEditingName.value = true
}

const cancelEditingName = () => {
  isEditingName.value = false
  editNameInput.value = ''
}

const handleSaveCrewName = async () => {
  if (!editNameInput.value.trim()) {
    await showAlert({
      type: 'info',
      title: 'Nombre requerido',
      message: 'El nombre de la tripulación no puede estar vacío.',
    })
    return
  }

  isActionLoading.value = true
  try {
    await updateCrewName(editNameInput.value.trim())
    isEditingName.value = false
    await showAlert({
      type: 'success',
      title: '¡Nombre actualizado!',
      message: `Tu tripulación ahora se llama "${crew.value?.name}".`,
    })
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo actualizar el nombre.',
    })
  } finally {
    isActionLoading.value = false
  }
}

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
    newCrewName.value = ''
    await showAlert({
      type: 'success',
      title: '¡Tripulación fundada!',
      message: `¡Bienvenido a bordo de "${crew.value?.name}"! Ahora puedes invitar a tus nakamas.`,
    })
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
      message: 'Por favor, ingresa un correo electrónico válido.',
    })
    return
  }

  if (email === authStore.userEmail.toLowerCase()) {
    await showAlert({
      type: 'info',
      title: 'Operación no válida',
      message: 'No puedes invitarte a ti mismo.',
    })
    return
  }

  isActionLoading.value = true
  try {
    await sendInvite(email)
    inviteEmail.value = ''
    await showAlert({
      type: 'success',
      title: '¡Invitación enviada!',
      message: `Hemos enviado una invitación a ${email}. Cuando inicie sesión con ese correo, podrá unirse a la tripulación.`,
    })
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

const handleCancelInvite = async (inviteId) => {
  const confirmed = await showConfirm({
    title: '¿Cancelar invitación?',
    message: 'Esta invitación quedará revocada y ya no podrá ser utilizada.',
  })
  if (!confirmed) return

  isActionLoading.value = true
  try {
    await cancelInvite(inviteId)
    await showAlert({
      type: 'success',
      title: 'Invitación cancelada',
      message: 'La invitación fue retirada con éxito.',
    })
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo cancelar la invitación.',
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
      title: '¡Bienvenido a la tripulación!',
      message: `Te has unido exitosamente a "${invite.crew?.name || 'la tripulación'}".`,
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
  isActionLoading.value = true
  try {
    await declineInvite(inviteId)
    await showAlert({
      type: 'info',
      title: 'Invitación rechazada',
      message: 'Has declinado unirte a esta tripulación.',
    })
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo rechazar la invitación.',
    })
  } finally {
    isActionLoading.value = false
  }
}

const handleLeaveCrew = async () => {
  const confirmed = await showConfirm({
    title: '¿Abandonar tripulación?',
    message: 'Si abandonas la tripulación, ya no verás las obras compartidas en común en tu listado.',
  })
  if (!confirmed) return

  isActionLoading.value = true
  try {
    await leaveCrew()
    await showAlert({
      type: 'info',
      title: 'Has dejado la tripulación',
      message: 'Ahora navegas como lobo solitario.',
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

const handleDeleteCrew = async () => {
  const confirmed = await showConfirm({
    title: '¿Eliminar tripulación permanentemente?',
    message: 'Esta acción disolverá la tripulación por completo y expulsará a todos los nakamas a bordo. Las obras compartidas volverán a ser de uso personal.',
    confirmText: 'Eliminar tripulación',
  })
  if (!confirmed) return

  isActionLoading.value = true
  try {
    await deleteCrew()
    await showAlert({
      type: 'info',
      title: 'Tripulación disuelta',
      message: 'La tripulación ha sido eliminada con éxito.',
    })
  } catch (err) {
    await showAlert({
      type: 'warning',
      title: 'Error',
      message: err.message || 'No se pudo eliminar la tripulación.',
    })
  } finally {
    isActionLoading.value = false
  }
}

const getMemberInitial = (member) => {
  const name = member.profile?.username || 'N'
  return name.charAt(0).toUpperCase()
}

const getMemberDisplayName = (member) => {
  return member.profile?.username || 'Nakama anónimo'
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return isoString
  }
}
</script>

<template>
  <PageContainer
    title="Tripulación"
    subtitle="Gestión del equipo, nakamas a bordo e invitaciones"
  >
    <template #header-actions v-if="hasCrew">
      <button
        v-if="isCaptain"
        type="button"
        :disabled="isActionLoading"
        class="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 font-body text-xs font-semibold text-red-400 transition-all duration-200 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
        title="Disolver y eliminar la tripulación permanentemente"
        @click="handleDeleteCrew"
      >
        <Trash2 :size="14" />
        <span>Eliminar tripulación</span>
      </button>

      <button
        type="button"
        :disabled="isActionLoading"
        class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-body text-xs font-semibold text-text-muted transition-all duration-200 hover:text-state-dropped hover:border-red-500/30 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
        title="Abandonar esta tripulación"
        @click="handleLeaveCrew"
      >
        <LogOut :size="14" />
        <span>Abandonar tripulación</span>
      </button>
    </template>

    <!-- ── CASO 1: NO TIENE TRIPULACIÓN ACTIVA ── -->
    <div v-if="!hasCrew" class="flex flex-col gap-10">

      <!-- Aviso del correo del usuario para recibir invitaciones -->
      <div class="flex items-center gap-3 rounded-[14px] border border-white/5 bg-bg-card p-4 max-w-xl text-xs text-text-muted">
        <Mail :size="16" class="text-green shrink-0" />
        <p>
          Tu correo para recibir invitaciones es: <strong class="text-white">{{ authStore.userEmail || 'tu correo registrado' }}</strong>. El Capitán debe enviar la invitación a esta dirección exacta.
        </p>
      </div>

      <!-- Invitaciones Recibidas Pendientes -->
      <section v-if="pendingInvites.length > 0">
        <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted flex items-center gap-2">
          <Mail :size="14" class="text-gold" />
          <span>Invitaciones recibidas ({{ pendingInvites.length }})</span>
        </h2>

        <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div 
            v-for="invite in pendingInvites" 
            :key="invite.id"
            class="relative flex flex-col justify-between gap-4 overflow-hidden rounded-[14px] border border-gold/30 bg-bg-card p-5"
          >
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-gold" />

            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-gold">
                <Sparkles :size="13" />
                <span>Invitación a bordo</span>
              </div>
              <h3 class="text-xl font-bold text-white mt-1">
                {{ invite.crew?.name || 'Tripulación Nakama' }}
              </h3>
              <p class="text-xs text-text-muted mt-1">
                Enviada por: <strong class="text-text-primary">{{ invite.inviter_profile?.username || 'Un Nakama' }}</strong>
              </p>
            </div>

            <div class="flex items-center gap-2 pt-3 border-t border-white/5">
              <button
                type="button"
                :disabled="isActionLoading"
                class="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green px-4 py-2 text-xs font-bold text-bg-base transition-all hover:bg-green-light cursor-pointer shadow-sm disabled:opacity-50"
                @click="handleAcceptInvite(invite)"
              >
                <Check :size="14" stroke-width="2.5" />
                <span>Aceptar y unirse</span>
              </button>
              <button
                type="button"
                :disabled="isActionLoading"
                class="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-text-muted hover:text-state-dropped hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                @click="handleDeclineInvite(invite.id)"
              >
                <X :size="14" />
                <span>Rechazar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Crear / Fundar Tripulación -->
      <section>
        <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted">
          Crear Tripulación
        </h2>

        <div class="relative overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-6 max-w-xl">
          <div class="absolute top-0 left-0 right-0 h-[3px] bg-green" />

          <div class="flex items-center gap-2.5 text-base font-bold text-white mb-1.5">
            <Ship :size="18" class="text-white" />
            <span>Funda tu propia tripulación</span>
          </div>
          <p class="text-xs text-text-muted leading-relaxed mb-6">
            Crea una tripulación para compartir tu colección con tu pareja o amigos. Al agregar contenido podrás elegir si es privado o compartido.
          </p>

          <form class="flex flex-col gap-4" @submit.prevent="handleCreateCrew">
            <div class="flex flex-col gap-1.5">
              <label for="crew-name" class="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Nombre del barco / tripulación
              </label>
              <input
                id="crew-name"
                v-model="newCrewName"
                type="text"
                placeholder="ej: Los Sombrero de Paja, Dúo Otaku, etc."
                class="w-full rounded-lg border border-white/10 bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 transition-colors focus:border-green focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="isActionLoading || !newCrewName.trim()"
              class="flex items-center justify-center gap-2 rounded-lg bg-green px-5 py-2.5 text-xs font-bold text-bg-base transition-all hover:bg-green-light cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ship :size="15" class="text-white" />
              <span>{{ isActionLoading ? 'Fundando...' : 'Fundar Tripulación' }}</span>
            </button>
          </form>
        </div>
      </section>

    </div>

    <!-- ── CASO 2: TIENE TRIPULACIÓN ACTIVA ── -->
    <div v-else class="flex flex-col gap-10">

      <!-- ── 1. Resumen / Info Cards (Misma cuadrícula de StatCard del Dashboard) ── -->
      <section>
        <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted">
          Resumen
        </h2>

        <div class="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          <!-- Card: Nombre de la Tripulación (con editar) -->
          <div class="relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-5">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-white/40" />

            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Barco</span>
              <Ship :size="18" class="text-white" />
            </div>

            <div class="my-2">
              <!-- Vista normal de nombre -->
              <div v-if="!isEditingName" class="flex items-center justify-between gap-2">
                <span class="text-xl font-bold text-white truncate" :title="crew.name">
                  {{ crew.name }}
                </span>
                <button
                  type="button"
                  class="shrink-0 p-1 rounded-md text-text-muted hover:text-green hover:bg-white/5 transition-colors cursor-pointer"
                  title="Editar nombre"
                  @click="startEditingName"
                >
                  <Pencil :size="13" />
                </button>
              </div>

              <!-- Edición inline de nombre -->
              <form v-else class="flex items-center gap-1.5" @submit.prevent="handleSaveCrewName">
                <input
                  v-model="editNameInput"
                  type="text"
                  class="w-full rounded-md border border-green bg-bg-elevated px-2 py-1 text-xs font-bold text-white focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  :disabled="isActionLoading"
                  class="p-1 rounded bg-green text-bg-base hover:bg-green-light cursor-pointer disabled:opacity-50"
                  title="Guardar"
                >
                  <Check :size="12" stroke-width="2.5" />
                </button>
                <button
                  type="button"
                  class="p-1 rounded text-text-muted hover:text-white cursor-pointer"
                  title="Cancelar"
                  @click="cancelEditingName"
                >
                  <X :size="12" />
                </button>
              </form>
            </div>

            <span class="text-[11px] text-text-muted">Creada el {{ formatDate(crew.created_at) }}</span>
          </div>

          <!-- Card: Nakamas a Bordo -->
          <div class="relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-5">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-green" />

            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Tripulantes</span>
              <Users :size="18" class="text-green" />
            </div>

            <div class="my-2">
              <span class="font-heading text-3xl font-bold leading-none text-green">
                {{ memberCount }}
              </span>
            </div>

            <span class="text-[11px] text-text-muted">Nakama{{ memberCount !== 1 ? 's' : '' }} en la nave</span>
          </div>

          <!-- Card: Tu Rol -->
          <div class="relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-5">
            <div class="absolute top-0 left-0 right-0 h-[3px]" :class="isCaptain ? 'bg-gold' : 'bg-green'" />

            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Tu Rol</span>
              <ShieldCheck :size="18" :class="isCaptain ? 'text-gold' : 'text-green'" />
            </div>

            <div class="my-2">
              <span class="text-xl font-bold" :class="isCaptain ? 'text-gold' : 'text-green'">
                {{ isCaptain ? 'Capitán' : 'Nakama' }}
              </span>
            </div>

            <span class="text-[11px] text-text-muted">{{ isCaptain ? 'Fundador del barco' : 'Miembro activo' }}</span>
          </div>

          <!-- Card: Estado de la Nave -->
          <div class="relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-5">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-green" />

            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Estado</span>
              <span class="size-2 rounded-full bg-green animate-pulse" />
            </div>

            <div class="my-2">
              <span class="text-xl font-bold text-white">Navegando</span>
            </div>

            <span class="text-[11px] text-text-muted">Biblioteca compartida activa</span>
          </div>
        </div>
      </section>

      <!-- ── 2. Miembros a bordo ── -->
      <section>
        <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted">
          Miembros a bordo ({{ memberCount }})
        </h2>

        <div class="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          <div
            v-for="member in members"
            :key="member.id"
            class="relative flex items-center justify-between gap-3 overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-4 transition-all duration-200 hover:border-white/20"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Avatar -->
              <div class="relative shrink-0">
                <img
                  v-if="member.profile?.avatar_url"
                  :src="member.profile.avatar_url"
                  :alt="getMemberDisplayName(member)"
                  class="size-10 rounded-lg object-cover border border-white/10"
                />
                <div
                  v-else
                  class="flex size-10 items-center justify-center rounded-lg bg-bg-elevated border border-white/10 text-sm font-bold text-white"
                >
                  {{ getMemberInitial(member) }}
                </div>
                <span
                  v-if="member.role === 'capitan'"
                  class="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold shadow text-black"
                  title="Capitán"
                >
                  👑
                </span>
              </div>

              <!-- Nombre y detalles -->
              <div class="min-w-0 flex flex-col">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="text-sm font-semibold text-white truncate">
                    {{ getMemberDisplayName(member) }}
                  </span>
                  <span
                    v-if="member.user_id === authStore.user?.id"
                    class="shrink-0 text-[10px] font-bold text-green bg-green/10 border border-green/30 px-1 rounded"
                  >
                    Tú
                  </span>
                </div>
                <span class="text-[10px] text-text-muted">
                  A bordo desde {{ formatDate(member.joined_at) }}
                </span>
              </div>
            </div>

            <!-- Rol badge -->
            <span
              class="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold"
              :class="member.role === 'capitan' ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-green/15 text-green border border-green/30'"
            >
              {{ member.role === 'capitan' ? 'Capitán' : 'Nakama' }}
            </span>
          </div>
        </div>
      </section>

      <!-- ── 3. Invitar Nakama ── -->
      <section>
        <h2 class="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-text-muted">
          Invitar Nakama
        </h2>

        <div class="relative overflow-hidden rounded-[14px] border border-white/5 bg-bg-card p-6">
          <div class="max-w-2xl">
            <div class="flex items-center gap-2 text-sm font-bold text-white mb-1">
              <UserPlus :size="16" class="text-green" />
              <span>Invitar a tu pareja o amigo</span>
            </div>
            <p class="text-xs text-text-muted mb-4 leading-relaxed">
              Ingresa el correo electrónico. Al iniciar sesión o registrarse con ese correo, podrá unirse automáticamente a esta tripulación.
            </p>

            <form class="flex items-center gap-3 max-md:flex-col" @submit.prevent="handleSendInvite">
              <div class="relative flex-1 max-md:w-full">
                <Mail :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  v-model="inviteEmail"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  class="w-full rounded-lg border border-white/10 bg-bg-elevated pl-9 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted/40 transition-colors focus:border-green focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                :disabled="isActionLoading || !inviteEmail.trim()"
                class="flex items-center justify-center gap-1.5 rounded-lg bg-green px-5 py-2.5 text-xs font-bold text-bg-base transition-all hover:bg-green-light cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full"
              >
                <Send :size="13" />
                <span>{{ isActionLoading ? 'Enviando...' : 'Enviar Invitación' }}</span>
              </button>
            </form>
          </div>

          <!-- Invitaciones Enviadas Pendientes -->
          <div v-if="sentInvites.length > 0" class="mt-6 pt-5 border-t border-white/5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
              <Clock :size="12" />
              <span>Invitaciones pendientes ({{ sentInvites.length }})</span>
            </h3>

            <div class="flex flex-col gap-2 max-w-2xl">
              <div
                v-for="inv in sentInvites"
                :key="inv.id"
                class="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-bg-elevated px-3.5 py-2 text-xs"
              >
                <div class="flex items-center gap-2 truncate">
                  <Mail :size="13" class="text-text-muted shrink-0" />
                  <span class="font-medium text-white truncate">{{ inv.invitee_email }}</span>
                  <span class="text-[10px] text-text-muted">• Enviada el {{ formatDate(inv.created_at) }}</span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="rounded bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                    Pendiente
                  </span>
                  <button
                    type="button"
                    class="p-1 rounded text-text-muted hover:text-state-dropped transition-colors cursor-pointer"
                    title="Cancelar invitación"
                    @click="handleCancelInvite(inv.id)"
                  >
                    <X :size="13" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>

  </PageContainer>
</template>
