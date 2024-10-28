import { makeAutoObservable } from "mobx";
import { LidState } from "../types/Stores";

export class LidsStore {
  frontLidState: LidState = LidState.Unknown;
  backLidState: LidState = LidState.Unknown;

  constructor() {
    makeAutoObservable(this);
  }
}
