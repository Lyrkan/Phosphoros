import { makeAutoObservable } from "mobx";
import { FlameSensorStatus, UartStatus } from "../types/Stores";

export class SystemStore {
  flameSensorStatus: FlameSensorStatus = FlameSensorStatus.Unknown;
  uartStatus: UartStatus = UartStatus.Unknown;

  constructor() {
    makeAutoObservable(this);
  }
}
