import { MessageType, SerialMessage, StatusReportPayload, GrblReportPayload, GrblMessagePayload, GrblAckPayload } from '../types/Messages';
import { ControllerSettings } from '../types/Settings';
import { LaserState, LidState, FlameSensorStatus, UartStatus, RootStore } from '../stores/RootStore';
import { PositionType } from '../types/Stores';

export class MessageHandlerService {
  constructor(private store: RootStore) {}

  handleMessage(message: SerialMessage): void {
    switch (message.t) {
      case MessageType.StatusReport:
        this.handleStatusReport(message.p as StatusReportPayload);
        break;
      case MessageType.GrblReport:
        this.handleGrblReport(message.p as GrblReportPayload);
        break;
      case MessageType.GrblMessage:
        this.handleGrblMessage(message.p as GrblMessagePayload);
        break;
      case MessageType.GrblAck:
        this.handleGrblAck(message.p as GrblAckPayload);
        break;
      case MessageType.ControllerSettings:
        this.handleControllerSettings(message.p as ControllerSettings);
        break;
    }
  }

  private handleStatusReport(payload: StatusReportPayload): void {
    const { laserStore, lidsStore, coolingStore, systemStore } = this.store;

    // Update cooling store
    coolingStore.inputFlow = payload.sensors.cooling.flow.in;
    coolingStore.outputFlow = payload.sensors.cooling.flow.out;
    coolingStore.inputTemperature = payload.sensors.cooling.temp.in;
    coolingStore.outputTemperature = payload.sensors.cooling.temp.out;

    // Update lids store
    lidsStore.frontLidState = payload.sensors.lids.front === 'opened' ? LidState.Opened : LidState.Closed;
    lidsStore.backLidState = payload.sensors.lids.back === 'opened' ? LidState.Opened : LidState.Closed;

    // Update system store
    systemStore.flameSensorStatus = payload.sensors.flame_sensor === 'triggered'
      ? FlameSensorStatus.Triggered
      : FlameSensorStatus.OK;

    // Map UART status
    const uartStatusMap: { [key: number]: UartStatus } = {
      0: UartStatus.Unknown,
      1: UartStatus.Connected,
      2: UartStatus.Disconnected
    };

    systemStore.uartStatus = uartStatusMap[payload.uart] || UartStatus.Unknown;

    // Update laser store relays
    laserStore.interlock = payload.relays.interlock;
    laserStore.lights = payload.relays.light;
    laserStore.beamPreview = payload.relays.beam_preview;
  }

  private handleGrblReport(payload: GrblReportPayload): void {
    const { laserStore } = this.store;

    // Update state if present
    if (payload.state !== undefined) {
      laserStore.currentState = this.mapGrblState(payload.state);
    }

    // Update positions if present
    if (payload.w_pos) {
      laserStore.setPosition(PositionType.Work, payload.w_pos);
    }

    if (payload.m_pos) {
      laserStore.setPosition(PositionType.Machine, payload.m_pos);
    }

    if (payload.wco) {
      laserStore.setPosition(PositionType.Offset, payload.wco);
    }

    // Update speed if present
    if (payload.feed?.rate !== undefined) {
      laserStore.speed = payload.feed.rate;
    }
  }

  private handleGrblMessage(payload: GrblMessagePayload): void {
    console.log('Grbl message:', payload.message);
  }

  private handleGrblAck(payload: GrblAckPayload): void {
    console.log(`Grbl acknowledgment for command ${payload.id}: ${payload.success ? 'success' : 'error'}`);
  }

  private handleControllerSettings(settings: ControllerSettings): void {
    this.store.settingsStore.updateSettings(settings);
  }

  private mapGrblState(state: number): LaserState {
    const grblStateMap: { [key: number]: LaserState } = {
      1: LaserState.Idle,
      2: LaserState.Run,
      3: LaserState.Hold,
      4: LaserState.HoldComplete,
      5: LaserState.Jog,
      6: LaserState.Alarm,
      7: LaserState.Door,
      8: LaserState.DoorHold,
      9: LaserState.DoorResume,
      10: LaserState.DoorRestart,
      11: LaserState.Check,
      12: LaserState.Home,
      13: LaserState.Sleep
    };

    return grblStateMap[state] || LaserState.Unknown;
  }
}
