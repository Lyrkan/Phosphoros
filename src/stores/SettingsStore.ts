import { makeAutoObservable } from "mobx";
import {
  BedSettings,
  ProbeSettings,
  OtaSettings,
  GrblSettings,
  RelaySettings,
  ControllerSettings
} from "../types/Settings";

export class SettingsStore {
  bed: BedSettings = {};
  probes: ProbeSettings = {};
  ota: OtaSettings = {};
  grbl: GrblSettings = {};
  relays: RelaySettings = {};

  constructor() {
    makeAutoObservable(this);
  }

  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      const value = source[key];
      if (value === undefined) continue;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
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
  }
}
