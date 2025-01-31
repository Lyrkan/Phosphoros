import { createContext, useContext } from "react";
import { SerialStore } from './SerialStore';
import { SettingsStore } from "./SettingsStore";
import { LaserStore } from "./LaserStore";
import { LidsStore } from "./LidsStore";
import { CoolingStore } from "./CoolingStore";
import { SystemStore } from "./SystemStore";
import { ToastStore } from "./ToastStore";
import { CoolingHistoryStore } from "./CoolingHistoryStore";
import { DevSimulationService } from '../services/DevSimulationService';
import { DebugStore } from './DebugStore';

export class RootStore {
  readonly laserStore: LaserStore;
  readonly lidsStore: LidsStore;
  readonly coolingStore: CoolingStore;
  readonly systemStore: SystemStore;
  readonly serialStore: SerialStore;
  readonly settingsStore: SettingsStore;
  readonly toastStore: ToastStore;
  readonly coolingHistoryStore: CoolingHistoryStore;
  public debugStore: DebugStore;

  constructor() {
    this.laserStore = new LaserStore();
    this.lidsStore = new LidsStore();
    this.coolingStore = new CoolingStore();
    this.systemStore = new SystemStore();
    this.serialStore = new SerialStore();
    this.toastStore = new ToastStore();
    this.settingsStore = new SettingsStore(this.toastStore);
    this.coolingHistoryStore = new CoolingHistoryStore(this);
    this.debugStore = new DebugStore();

    if (globalThis.isDev) {
      (new DevSimulationService(this)).start();
    }

    // Start tracking cooling metrics history
    this.coolingHistoryStore.startTracking();
  }
}

const RootStoreContext = createContext<RootStore | null>(null);

export const RootStoreProvider = RootStoreContext.Provider;

export function useStore(): RootStore {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error("useStore must be used within a RootStoreProvider");
  }
  return store;
}
