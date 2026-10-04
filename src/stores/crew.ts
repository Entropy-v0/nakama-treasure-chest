import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { crewService } from '../services/supabase/crew.service';
import type { Crew, CrewMember, CrewInvite } from '../types/crew';
import { useAuthStore } from './auth';

export const useCrewStore = defineStore('crew', () => {
  const crew = ref<Crew | null>(null);
  const members = ref<CrewMember[]>([]);
  const pendingInvites = ref<CrewInvite[]>([]);
  const sentInvites = ref<CrewInvite[]>([]);
  const isLoading = ref<boolean>(false);
  const isLoaded = ref<boolean>(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  const reset = () => {
    crew.value = null;
    members.value = [];
    pendingInvites.value = [];
    sentInvites.value = [];
    isLoading.value = false;
    isLoaded.value = false;
    error.value = null;
  };

  // Limpiar inmediatamente si el usuario cierra sesión o cambia de cuenta
  watch(
    () => authStore.user?.id,
    (newId, oldId) => {
      if (newId !== oldId) {
        reset();
      }
    }
  );

  const hasCrew = computed<boolean>(() => Boolean(crew.value));
  const memberCount = computed<number>(() => members.value.length);

  const isCaptain = computed<boolean>(() => {
    if (!crew.value || !authStore.user) return false;
    return crew.value.created_by === authStore.user.id;
  });

  const partner = computed<CrewMember | null>(() => {
    if (!authStore.user || members.value.length <= 1) return null;
    return members.value.find(m => m.user_id !== authStore.user?.id) || null;
  });

  const hasPendingInvites = computed<boolean>(() => pendingInvites.value.length > 0);

  /**
   * Carga la tripulación del usuario y las posibles invitaciones que tenga pendientes con soporte de caché.
   */
  const loadCrewData = async (force = false) => {
    if (isLoaded.value && !force) {
      return;
    }

    if (!authStore.isAuthenticated) {
      reset();
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const [crewRes, invitesRes] = await Promise.all([
        crewService.getMyCrew(),
        crewService.getPendingInvites(),
      ]);

      if (crewRes) {
        crew.value = crewRes.crew;
        members.value = crewRes.members;
        // Cargar invitaciones enviadas pendientes
        const sInvites = await crewService.getSentInvites(crewRes.crew.id);
        sentInvites.value = sInvites || [];
      } else {
        crew.value = null;
        members.value = [];
        sentInvites.value = [];
      }

      pendingInvites.value = invitesRes || [];
      isLoaded.value = true;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar datos de tripulación';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Crea una nueva tripulación.
   */
  const createCrew = async (name: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await crewService.createCrew(name);
      crew.value = res.crew;
      members.value = res.members;
      sentInvites.value = [];
      return res;
    } catch (err: any) {
      error.value = err.message || 'Error al crear tripulación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Actualiza el nombre de la tripulación.
   */
  const updateCrewName = async (name: string) => {
    if (!crew.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await crewService.updateCrewName(crew.value.id, name);
      crew.value = updated;
      return updated;
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el nombre de la tripulación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Envía una invitación por correo.
   */
  const sendInvite = async (email: string) => {
    if (!crew.value) throw new Error('No tienes una tripulación activa');
    isLoading.value = true;
    error.value = null;
    try {
      const invite = await crewService.sendInvite(crew.value.id, email);
      sentInvites.value.push(invite);
      return invite;
    } catch (err: any) {
      error.value = err.message || 'Error al enviar invitación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cancela una invitación enviada.
   */
  const cancelInvite = async (inviteId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await crewService.cancelInvite(inviteId);
      sentInvites.value = sentInvites.value.filter(i => i.id !== inviteId);
    } catch (err: any) {
      error.value = err.message || 'Error al cancelar la invitación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Acepta una invitación pendiente y recarga la tripulación.
   */
  const acceptInvite = async (invite: CrewInvite) => {
    isLoading.value = true;
    error.value = null;
    try {
      await crewService.acceptInvite(invite.id, invite.crew_id);
      await loadCrewData();
    } catch (err: any) {
      error.value = err.message || 'Error al aceptar invitación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Rechaza una invitación pendiente.
   */
  const declineInvite = async (inviteId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await crewService.declineInvite(inviteId);
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    } catch (err: any) {
      error.value = err.message || 'Error al rechazar invitación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Sale o abandona la tripulación actual.
   */
  const leaveCrew = async () => {
    if (!crew.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      await crewService.leaveCrew(crew.value.id);
      crew.value = null;
      members.value = [];
      sentInvites.value = [];
    } catch (err: any) {
      error.value = err.message || 'Error al salir de la tripulación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Elimina o disuelve permanentemente la tripulación.
   */
  const deleteCrew = async () => {
    if (!crew.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      await crewService.deleteCrew(crew.value.id);
      crew.value = null;
      members.value = [];
      sentInvites.value = [];
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar la tripulación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    crew,
    members,
    pendingInvites,
    sentInvites,
    isLoading,
    isLoaded,
    error,
    hasCrew,
    memberCount,
    isCaptain,
    partner,
    hasPendingInvites,
    loadCrewData,
    createCrew,
    updateCrewName,
    sendInvite,
    cancelInvite,
    acceptInvite,
    declineInvite,
    leaveCrew,
    deleteCrew,
    reset,
  };
});
