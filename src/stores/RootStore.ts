import { createContext, useContext } from "react";
import { SerialStore } from './SerialStore';
import { SettingsStore } from "./SettingsStore";
import { LaserStore } from "./LaserStore";
import { LidsStore } from "./LidsStore";
import { CoolingStore } from "./CoolingStore";
import { SystemStore } from "./SystemStore";
import { ToastStore } from "./ToastStore";
export class RootStore {
  laserStore: LaserStore;
  lidsStore: LidsStore;
  coolingStore: CoolingStore;
  systemStore: SystemStore;
  serialStore: SerialStore;
  settingsStore: SettingsStore;
  toastStore: ToastStore;

  constructor() {
    this.laserStore = new LaserStore();
    this.lidsStore = new LidsStore();
    this.coolingStore = new CoolingStore();
    this.systemStore = new SystemStore();
    this.serialStore = new SerialStore();
    this.toastStore = new ToastStore();
    this.settingsStore = new SettingsStore(this.toastStore);
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