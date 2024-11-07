import { makeAutoObservable, action } from "mobx";
import { LaserState, AlarmState, PositionType , Position } from "../types/Stores";

export class LaserStore {
  private _currentState: LaserState = LaserState.Unknown;
  private _currentAlarm: AlarmState = AlarmState.Unknown;

  private _speed = 0;
  private _workPosition: Position = { x: 0, y: 0, z: 0 };
  private _machinePosition: Position = { x: 0, y: 0, z: 0 };
  private _workOffset: Position = { x: 0, y: 0, z: 0 };

  private _interlock?: boolean;
  private _lights?: boolean;
  private _airAssist?: boolean;
  private _beamPreview?: boolean;

  constructor() {
    makeAutoObservable(this);
  }

  get currentState() {
    return this._currentState;
  }

  get currentAlarm() {
    return this._currentAlarm;
  }

  get speed() {
    return this._speed;
  }

  get workPosition(): Readonly<Position> {
    return this._workPosition;
  }

  get machinePosition(): Readonly<Position> {
    return this._machinePosition;
  }

  get workOffset() {
    return this._workOffset;
  }

  get interlock() {
    return this._interlock;
  }

  get lights() {
    return this._lights;
  }

  get airAssist() {
    return this._airAssist;
  }

  get beamPreview() {
    return this._beamPreview;
  }

  setState = action((state: LaserState) => {
    this._currentState = state;
  });

  setAlarm = action((alarm: AlarmState) => {
    this._currentAlarm = alarm;
  });

  setSpeed = action((speed: number) => {
    this._speed = speed;
  });

  setWorkPosition = action((position: Position) => {
    this._workPosition = position;
  });

  setInterlock = action((value: boolean) => {
    this._interlock = value;
  });

  setLights = action((value: boolean) => {
    this._lights = value;
  });

  setBeamPreview = action((value: boolean) => {
    this._beamPreview = value;
  });

  setPosition = action((type: PositionType, position: Position) => {
    switch (type) {
      case PositionType.Work:
        this._workPosition = position;
        break;
      case PositionType.Machine:
        this._machinePosition = position;
        break;
      case PositionType.Offset:
        this._workOffset = position;
        break;
    }
  });
}
