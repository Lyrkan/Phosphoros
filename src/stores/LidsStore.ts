import { makeAutoObservable, action } from "mobx";
import { LidState } from "../types/Stores";

export class LidsStore {
  private _frontLidState: LidState = LidState.Unknown;
  private _backLidState: LidState = LidState.Unknown;

  constructor() {
    makeAutoObservable(this);
  }

  get frontLidState() {
    return this._frontLidState;
  }

  get backLidState() {
    return this._backLidState;
  }

  setFrontLidState = action((state: LidState) => {
    this._frontLidState = state;
  });

  setBackLidState = action((state: LidState) => {
    this._backLidState = state;
  });
}
