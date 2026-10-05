import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string | undefined;
  durationMs: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => number;
  dismiss: (id: number) => void;
  clear: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts.slice(-4), { ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

const DEFAULT_DURATION = 4000;

function show(tone: ToastTone, title: string, description?: string, durationMs?: number) {
  return useToastStore
    .getState()
    .push({ tone, title, description, durationMs: durationMs ?? DEFAULT_DURATION });
}

/** Imperative API so mutations and other non-component code can notify the user. */
export const toast = {
  success: (title: string, description?: string) => show('success', title, description),
  error: (title: string, description?: string) => show('error', title, description, 6000),
  info: (title: string, description?: string) => show('info', title, description),
  dismiss: (id: number) => useToastStore.getState().dismiss(id),
};
