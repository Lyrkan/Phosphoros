export enum BedControlMode {
  Grbl = 1,
  Stepper = 2
}

export interface BedSettings {
  control_mode?: BedControlMode;
  screw_lead_um?: number;
  microstep_multiplier?: number;
  steps_per_revolution?: number;
  moving_speed?: number;
  homing_speed?: number;
  backoff_distance_um?: number;
}

export interface ProbeRangeSettings {
  min?: number;
  max?: number;
}

export interface ProbeSettings {
  cooling?: {
    flow?: ProbeRangeSettings;
    temp?: ProbeRangeSettings;
  };
}

export interface OtaSettings {
  login?: string;
  password?: string;
}

export interface GrblSettings {
  jog_speed?: number;
  default_timeout_ms?: number;
  homing_timeout_ms?: number;
}

export enum AlarmBehavior {
  EnableWhenRunning = 1 << 0,
  EnableWhenNotIdling = 1 << 1,
  EnableWhenFlameSensorTriggered = 1 << 2,
  EnableWhenCoolingIssue = 1 << 3,
  EnableWhenLidOpened = 1 << 4
}

export enum InterlockBehavior {
  DisableWhenLidOpened = 1 << 0,
  DisableWhenCoolingIssue = 1 << 1,
  DisableWhenFlameSensorTriggered = 1 << 2
}

export interface RelaySettings {
  alarm_behavior?: number;
  interlock_behavior?: number;
}

export interface ControllerSettings {
  bed?: BedSettings;
  probes?: ProbeSettings;
  ota?: OtaSettings;
  grbl?: GrblSettings;
  relays?: RelaySettings;
}
