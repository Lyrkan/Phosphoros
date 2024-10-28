import { makeAutoObservable } from "mobx";
import { LaserState, AlarmState, PositionType } from "../types/Stores";
import { Position } from "../types/Stores";

export class LaserStore {
  currentState: LaserState = LaserState.Unknown;
  alarmState: AlarmState = AlarmState.Unknown;
  speed: number = 0;

  workPosition: Position = { x: 0, y: 0, z: 0 };
  machinePosition: Position = { x: 0, y: 0, z: 0 };
  workOffset: Position = { x: 0, y: 0, z: 0 };

  interlock: boolean = false;
  lights: boolean = false;
  airAssist: boolean = false;
  beamPreview: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setPosition(type: PositionType, position: Position) {
    switch (type) {
      case PositionType.Work:
        this.workPosition = position;
        break;
      case PositionType.Machine:
        this.machinePosition = position;
        break;
      case PositionType.Offset:
        this.workOffset = position;
        break;
    }
  }
}
