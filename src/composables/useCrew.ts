/**
 * useCrew.ts — Composable para gestión de la Tripulación (Nakama Network)
 * Expone de forma limpia y reactiva las propiedades y acciones de useCrewStore.
 */
import { storeToRefs } from 'pinia';
import { useCrewStore } from '../stores/crew';

export function useCrew() {
  const crewStore = useCrewStore();

  const {
    crew,
    members,
    pendingInvites,
    sentInvites,
    isLoading,
    error,
    hasCrew,
    memberCount,
    isCaptain,
    partner,
    hasPendingInvites,
  } = storeToRefs(crewStore);

  return {
    // Estado reactivo
    crew,
    members,
    pendingInvites,
    sentInvites,
    isLoading,
    error,
    hasCrew,
    memberCount,
    isCaptain,
    partner,
    hasPendingInvites,

    // Acciones
    loadCrewData: crewStore.loadCrewData,
    createCrew: crewStore.createCrew,
    updateCrewName: crewStore.updateCrewName,
    sendInvite: crewStore.sendInvite,
    cancelInvite: crewStore.cancelInvite,
    acceptInvite: crewStore.acceptInvite,
    declineInvite: crewStore.declineInvite,
    leaveCrew: crewStore.leaveCrew,
    deleteCrew: crewStore.deleteCrew,
  };
}
