import { makeAutoObservable } from "mobx";

export class CoolingStore {
  inputFlow = 0;
  outputFlow = 5;
  inputTemperature = 20;
  outputTemperature = 30;

  constructor() {
    makeAutoObservable(this);
  }
}
