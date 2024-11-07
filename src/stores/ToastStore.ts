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
  private nextId = 1;
  private _toasts: Toast[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get toasts(): ReadonlyArray<Toast> {
    return this._toasts;
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
    this._toasts.push(toast);
  }

  remove(id: number) {
    this._toasts = this._toasts.filter(toast => toast.id !== id);
  }
}
