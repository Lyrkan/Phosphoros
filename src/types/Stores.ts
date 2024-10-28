export enum LaserState {
  Idle = "Idle",
  Run = "Run",
  Hold = "Hold",
  HoldComplete = "Hold Complete",
  Jog = "Jog",
  Alarm = "Alarm",
  Door = "Door",
  DoorHold = "Door Hold",
  DoorResume = "Door Resume",
  DoorRestart = "Door Restart",
  Check = "Check",
  Home = "Home",
  Sleep = "Sleep",
  Unknown = "Unknown"
}

export enum AlarmState {
  NoAlarm = "No Alarm",
  HardLimit = "Hard limit",
  SoftLimit = "Soft limit",
  AbortCycle = "Abort cycle",
  ProbeFailInitial = "Probe fail initial",
  ProbeFailContact = "Probe fail contact",
  HomingFailReset = "Homing fail reset",
  HomingFailDoor = "Homing fail door",
  FailPulloff = "Fail pulloff",
  HomingFailApproach = "Homing fail approach",
  Unknown = "Unknown"
}

export enum LidState {
  Unknown = "Unknown",
  Opened = "Opened",
  Closed = "Closed"
}

export enum FlameSensorStatus {
  Unknown = "Unknown",
  OK = "OK",
  Triggered = "Triggered"
}

export enum UartStatus {
  Unknown = "Unknown",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Error = "Error",
}

export enum PositionType {
  Work = 'work',
  Machine = 'machine',
  Offset = 'offset'
}

export interface Position {
  x: number;
  y: number;
  z: number;
}
