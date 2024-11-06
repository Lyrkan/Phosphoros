import { makeAutoObservable } from "mobx";

export class CoolingStore {
  inputFlow?: number;
  outputFlow?: number;
  inputTemperature?: number;
  outputTemperature?: number;

  constructor() {
    makeAutoObservable(this);
  }
}
