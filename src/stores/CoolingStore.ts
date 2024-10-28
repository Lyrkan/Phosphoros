import { makeAutoObservable } from "mobx";

export class CoolingStore {
  inputFlow: number = 0;
  outputFlow: number = 5;
  inputTemperature: number = 20;
  outputTemperature: number = 30;

  constructor() {
    makeAutoObservable(this);
  }
}
