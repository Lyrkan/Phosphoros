import { makeAutoObservable } from "mobx";
import { FlameSensorStatus, UartStatus } from "../types/Stores";

export class SystemStore {
  private _flameSensorStatus: FlameSensorStatus = FlameSensorStatus.Unknown;
  private _uartStatus: UartStatus = UartStatus.Unknown;

  constructor() {
    makeAutoObservable(this);
  }

  get flameSensorStatus() {
    return this._flameSensorStatus;
  }

  get uartStatus() {
    return this._uartStatus;
  }

  setFlameSensorStatus = (status: FlameSensorStatus) => {
    this._flameSensorStatus = status;
  };

  setUartStatus = (status: UartStatus) => {
    this._uartStatus = status;
  };
}
