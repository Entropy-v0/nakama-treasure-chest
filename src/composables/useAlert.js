import { reactive } from 'vue';

const state = reactive({
  isOpen: false,
  type: 'info', // 'warning', 'info', 'success'
  title: '',
  message: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  isConfirm: false,
  resolvePromise: null,
});

export function useAlert() {
  const showAlert = ({
    type = 'info',
    title = '',
    message = '',
    confirmText = 'Aceptar',
  } = {}) => {
    state.type = type;
    state.title = title;
    state.message = message;
    state.confirmText = confirmText;
    state.isConfirm = false;
    state.isOpen = true;

    return new Promise((resolve) => {
      state.resolvePromise = resolve;
    });
  };

  const showConfirm = ({
    type = 'warning',
    title = '¿Estás seguro?',
    message = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
  } = {}) => {
    state.type = type;
    state.title = title;
    state.message = message;
    state.confirmText = confirmText;
    state.cancelText = cancelText;
    state.isConfirm = true;
    state.isOpen = true;

    return new Promise((resolve) => {
      state.resolvePromise = resolve;
    });
  };

  const confirm = () => {
    state.isOpen = false;
    if (state.resolvePromise) {
      state.resolvePromise(true);
      state.resolvePromise = null;
    }
  };

  const cancel = () => {
    state.isOpen = false;
    if (state.resolvePromise) {
      state.resolvePromise(false);
      state.resolvePromise = null;
    }
  };

  return {
    state,
    showAlert,
    showConfirm,
    confirm,
    cancel
  };
}
