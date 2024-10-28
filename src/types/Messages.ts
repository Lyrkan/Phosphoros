import { ControllerSettings } from "./Settings";

export enum MessageType {
  StatusReport = 0,
  GrblReport = 1,
  GrblMessage = 2,
  GrblAck = 3,
  ControllerSettings = 4,
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
    light: boolean;
    beam_preview: boolean;
  };
  uart: number;
}

export interface GrblReportPayload {
  state?: number;
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
}

export interface GrblMessagePayload {
  message: string;
}

export interface GrblAckPayload {
  id: number;
  success: boolean;
}

export type SerialMessage =
  | { t: MessageType.StatusReport; p: StatusReportPayload }
  | { t: MessageType.GrblReport; p: GrblReportPayload }
  | { t: MessageType.GrblMessage; p: GrblMessagePayload }
  | { t: MessageType.GrblAck; p: GrblAckPayload }
  | { t: MessageType.ControllerSettings; p: ControllerSettings };
