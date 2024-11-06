import { makeAutoObservable } from "mobx";
import { LaserState, AlarmState, PositionType , Position } from "../types/Stores";

export class LaserStore {
  currentState: LaserState = LaserState.Unknown;
  alarmState: AlarmState = AlarmState.Unknown;

  speed = 0;
  workPosition: Position = { x: 0, y: 0, z: 0 };
  machinePosition: Position = { x: 0, y: 0, z: 0 };
  workOffset: Position = { x: 0, y: 0, z: 0 };

  interlock?: boolean;
  lights?: boolean;
  airAssist?: boolean;
  beamPreview?: boolean;

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
