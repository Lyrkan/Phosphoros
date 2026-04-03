import { makeAutoObservable } from "mobx";

export class CoolingStore {
  private _inputFlow?: number;
  private _outputFlow?: number;
  private _inputTemperature?: number;
  private _outputTemperature?: number;

  constructor() {
    makeAutoObservable(this);
  }

  get inputFlow() {
    return this._inputFlow;
  }

  get outputFlow() {
    return this._outputFlow;
  }

  get inputTemperature() {
    return this._inputTemperature;
  }

  get outputTemperature() {
    return this._outputTemperature;
  }

  setInputFlow = (value: number) => {
    this._inputFlow = value;
  };

  setOutputFlow = (value: number) => {
    this._outputFlow = value;
  };

  setInputTemperature = (value: number) => {
    this._inputTemperature = value;
  };

  setOutputTemperature = (value: number) => {
    this._outputTemperature = value;
  };
}
