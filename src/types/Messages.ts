import { ControllerSettings } from "./Settings";

export enum IncomingMessageType {
  StatusReport = 0,
  GrblReport = 1,
  GrblMessage = 2,
  GrblAck = 3,
  ControllerSettings = 4,
}

export enum OutgoingMessageType {
  GrblAction = 0,
  SettingsSet = 1,
  SettingsGet = 2,
  StatusGet = 3,
  RelaysSet = 4,
}

export interface StatusReportPayload {
  sensors: {
    cooling: {
      flow: { in: number; out: number };
      temp: { in: number; out: number };
    };
    lids: {
      front: 'opened' | 'closed';
      back: 'opened' | 'closed';
    };
    flame_sensor: 'triggered' | 'ok';
  };
  alerts: {
    cooling: boolean;
    lids: boolean;
    flame_sensor: boolean;
  };
  relays: {
    interlock: boolean;
    alarm: boolean;
    lights: boolean;
    accessory: boolean;
    air_assist: boolean;
  };
  uart: number;
}

export interface GrblReportPayload {
  state?: number;
  alarm?: number;
  w_pos?: { x: number; y: number; z: number };
  m_pos?: { x: number; y: number; z: number };
  wco?: { x: number; y: number; z: number };
  buffer?: {
    planned_buffer_available_blocks: number;
    rx_buffer_available_bytes: number;
  };
  feed?: {
    rate: number;
    spindle_speed: number;
  };
  line_number?: number;
  active_pins?: {
    x: boolean;
    y: boolean;
    z: boolean;
    p: boolean;
    d: boolean;
    h: boolean;
    r: boolean;
    s: boolean;
  };
  active_accessories?: {
    spindle_cw: boolean;
    spindle_ccw: boolean;
    flood_coolant: boolean;
    mist_coolant: boolean;
  }
}

export interface GrblMessagePayload {
  message: string;
}

export interface GrblAckPayload {
  id: number;
  success: boolean;
}

export type SettingsPayload = ControllerSettings

export interface GrblActionPayload {
  message: string;
  id?: number;
}

export interface RelaysSetPayload {
  interlock?: boolean;
  air_assist?: boolean;
  lights?: boolean;
  accessory?: boolean;
}

export type CommandPayloadMap = {
  [OutgoingMessageType.GrblAction]: GrblActionPayload;
  [OutgoingMessageType.SettingsSet]: Partial<ControllerSettings>;
  [OutgoingMessageType.SettingsGet]: Record<string, never>;
  [OutgoingMessageType.StatusGet]: Record<string, never>;
  [OutgoingMessageType.RelaysSet]: RelaysSetPayload;
};

export type IncomingMessage =
  | { t: IncomingMessageType.StatusReport; p: StatusReportPayload }
  | { t: IncomingMessageType.GrblReport; p: GrblReportPayload }
  | { t: IncomingMessageType.GrblMessage; p: GrblMessagePayload }
  | { t: IncomingMessageType.GrblAck; p: GrblAckPayload }
  | { t: IncomingMessageType.ControllerSettings; p: ControllerSettings };


export interface OutgoingMessageBase<T extends OutgoingMessageType, P> {
  a: T;
  p: P;
}

export type OutgoingMessage = {
  [K in OutgoingMessageType]: OutgoingMessageBase<K, CommandPayloadMap[K]>
}[OutgoingMessageType];
