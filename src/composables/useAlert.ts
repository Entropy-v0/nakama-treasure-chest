import { reactive } from 'vue';

export type AlertType = 'info' | 'warning' | 'success' | 'error';

export interface AlertOptions {
  type?: AlertType;
  title?: string;
  message?: string;
  confirmText?: string;
}

export interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
}

export interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isConfirm: boolean;
  resolvePromise: ((value: boolean) => void) | null;
}

const state = reactive<AlertState>({
  isOpen: false,
  type: 'info',
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
  }: AlertOptions = {}): Promise<boolean> => {
    state.type = type;
    state.title = title;
    state.message = message;
    state.confirmText = confirmText;
    state.isConfirm = false;
    state.isOpen = true;

    return new Promise<boolean>((resolve) => {
      state.resolvePromise = resolve;
    });
  };

  const showConfirm = ({
    type = 'warning',
    title = '¿Estás seguro?',
    message = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
  }: ConfirmOptions = {}): Promise<boolean> => {
    state.type = type;
    state.title = title;
    state.message = message;
    state.confirmText = confirmText;
    state.cancelText = cancelText;
    state.isConfirm = true;
    state.isOpen = true;

    return new Promise<boolean>((resolve) => {
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
    cancel,
  };
}
