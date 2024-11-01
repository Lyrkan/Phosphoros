import { makeAutoObservable } from "mobx";

export interface Toast {
  id: number;
  title: string;
  message: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
  autohide?: boolean;
  delay?: number;
}

export class ToastStore {
  toasts: Toast[] = [];
  private nextId = 1;

  constructor() {
    makeAutoObservable(this);
  }

  show(title: string, message: string, variant: Toast['variant'] = 'info', autohide = true, delay = 3000) {
    const toast: Toast = {
      id: this.nextId++,
      title,
      message,
      variant,
      autohide,
      delay
    };
    this.toasts.push(toast);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }
}
