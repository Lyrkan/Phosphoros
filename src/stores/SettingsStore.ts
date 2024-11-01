import { makeAutoObservable } from "mobx";
import {
  BedSettings,
  ProbeSettings,
  OtaSettings,
  GrblSettings,
  RelaySettings,
  ControllerSettings,
  BedControlMode
} from "../types/Settings";
import { OutgoingMessageType } from "../types/Messages";
import { ISerialService } from "../services/interfaces/ISerialService";
import { ToastStore } from "./ToastStore";

export class SettingsStore {
  private toastStore: ToastStore;
  bed: BedSettings = { control_mode: BedControlMode.Grbl };
  probes: ProbeSettings = {};
  ota: OtaSettings = {};
  grbl: GrblSettings = {};
  relays: RelaySettings = {};
  private serialService: ISerialService | null = null;
  private updateTimeout: NodeJS.Timeout | null = null;

  constructor(toastStore: ToastStore) {
    this.toastStore = toastStore;
    makeAutoObservable(this);
  }

  setSerialService(service: ISerialService) {
    this.serialService = service;
  }

  private debouncedSendUpdate = (settings: Partial<ControllerSettings>) => {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(async () => {
      try {
        if (!this.serialService) {
          throw new Error('Serial service not initialized');
        }

        await this.serialService.sendMessage({
          a: OutgoingMessageType.SettingsSet,
          p: settings
        });
      } catch (error) {
        this.toastStore.show(
          'Settings Update Failed',
          `Failed to send settings update to the controller: ${error.message}`,
          'danger'
        );
      }
    }, 1000);
  };

  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      const value = source[key];
      if (value === undefined) continue;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = this.deepMerge(target[key] || {} as any, value as any);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  updateSettings(settings: ControllerSettings) {
    if (settings.bed) {
      this.bed = this.deepMerge(this.bed, settings.bed);
    }
    if (settings.probes) {
      this.probes = this.deepMerge(this.probes, settings.probes);
    }
    if (settings.ota) {
      this.ota = this.deepMerge(this.ota, settings.ota);
    }
    if (settings.grbl) {
      this.grbl = this.deepMerge(this.grbl, settings.grbl);
    }
    if (settings.relays) {
      this.relays = this.deepMerge(this.relays, settings.relays);
    }

    // Send only the changed settings
    this.debouncedSendUpdate(settings);
  }
}import { RootStore } from "./RootStore";

