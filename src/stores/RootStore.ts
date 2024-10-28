import { makeAutoObservable } from "mobx";
import { createContext, useContext } from "react";
import { SerialStore } from './SerialStore';
import { SerialService } from '../services/SerialService';
import { MessageHandlerService } from "../services/MessageHandlerService";
import { LaserState, AlarmState, LidState, FlameSensorStatus, UartStatus } from "../types/Stores";
import { SettingsStore } from "./SettingsStore";
import { LaserStore } from "./LaserStore";
import { LidsStore } from "./LidsStore";
import { CoolingStore } from "./CoolingStore";
import { SystemStore } from "./SystemStore";

export class RootStore {
  laserStore: LaserStore;
  lidsStore: LidsStore;
  coolingStore: CoolingStore;
  systemStore: SystemStore;
  serialStore: SerialStore;
  settingsStore: SettingsStore;
  messageHandler: MessageHandlerService;
  serialService: SerialService;

  constructor() {
    this.laserStore = new LaserStore();
    this.lidsStore = new LidsStore();
    this.coolingStore = new CoolingStore();
    this.systemStore = new SystemStore();
    this.serialStore = new SerialStore();
    this.settingsStore = new SettingsStore();
    this.messageHandler = new MessageHandlerService(this);
    this.serialService = new SerialService(this.serialStore, this.messageHandler);
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

export const rootStore = new RootStore();

export { LaserState, AlarmState, LidState, FlameSensorStatus, UartStatus };
