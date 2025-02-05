import { makeAutoObservable, action } from "mobx";
import { LaserState, AlarmState, PositionType , Position } from "../types/Stores";

export interface ActivePins {
  x: boolean;
  y: boolean;
  z: boolean;
  p: boolean;
  d: boolean;
  h: boolean;
  r: boolean;
  s: boolean;
}

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

  private _activePins: ActivePins = {
    x: false,
    y: false,
    z: false,
    p: false,
    d: false,
    h: false,
    r: false,
    s: false
  };

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

  get activePins(): Readonly<ActivePins> {
    return this._activePins;
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

  setAirAssist = action((value: boolean) => {
    this._airAssist = value;
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

  setActivePins = action((pins: Partial<ActivePins>) => {
    this._activePins = { ...this._activePins, ...pins };
  });
}
