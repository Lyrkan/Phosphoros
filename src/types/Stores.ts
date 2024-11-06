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
  Unknown = "Invalid/unknown Grbl alarm",
  NoAlarm = "No Alarm",
  HardLimit = "ard limit triggered",
  SoftLimit = "G-code motion target exceeds machine travel",
  AbortCycle = "Reset while in motion, re-homing is highly recommended",
  ProbeFailInitial = "Probe fail: The probe is not in the expected initial state before starting probe cycle",
  ProbeFailContact = "Probe fail: Probe did not contact the workpiece within the programmed travel",
  HomingFailReset = "Homing fail: Reset during active homing cycle",
  HomingFailDoor = "Homing fail: Safety door was opened during active homing cycle",
  FailPulloff = "Homing fail: Cycle failed to clear limit switch when pulling off, try increasing pull-off setting or check wiring",
  HomingFailApproach = "Homing fail: Could not find limit switch within search distance",
  SpindleControl = "Spindle control",
  ControlPin = "Control pin",
  AmbiguousSwitch = "Ambiguous switch: There is a limit switch active",
  HardStop = "Hard stop",
  Unhomed = "Unhomed: Your machine needs to be homed",
  Init = "Init"
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
