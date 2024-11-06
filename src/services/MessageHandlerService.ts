import { IncomingMessageType, IncomingMessage, StatusReportPayload, GrblReportPayload, GrblMessagePayload, GrblAckPayload } from '../types/Messages';
import { ControllerSettings } from '../types/Settings';
import { RootStore } from '../stores/RootStore';
import { LaserState, LidState, FlameSensorStatus, UartStatus , PositionType, AlarmState } from '../types/Stores';
import { IMessageHandlerService } from './interfaces/IMessageHandlerService';
import { useCommandTracking } from '../hooks/useCommandTracking';

export class MessageHandlerService implements IMessageHandlerService {
  private commandTracking?: ReturnType<typeof useCommandTracking>;

  constructor(private store: RootStore) {
  }

  setCommandTracking(commandTracking: ReturnType<typeof useCommandTracking>) {
    this.commandTracking = commandTracking;
  }

  handleMessage(message: IncomingMessage): void {
    switch (message.t) {
      case IncomingMessageType.StatusReport:
        this.handleStatusReport(message.p as StatusReportPayload);
        break;
      case IncomingMessageType.GrblReport:
        this.handleGrblReport(message.p as GrblReportPayload);
        break;
      case IncomingMessageType.GrblMessage:
        this.handleGrblMessage(message.p as GrblMessagePayload);
        break;
      case IncomingMessageType.GrblAck:
        this.handleGrblAck(message.p as GrblAckPayload);
        break;
      case IncomingMessageType.ControllerSettings:
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

    // Update alarm if present
    if (payload.alarm !== undefined) {
      laserStore.currentAlarm = this.mapGrblAlarm(payload.alarm);
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
    this.commandTracking?.handleCommandAck(payload.id, payload.success);
  }

  private handleControllerSettings(settings: ControllerSettings): void {
    this.store.settingsStore.updateSettings(settings);
    this.store.settingsStore.isLoaded = true;
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

  private mapGrblAlarm(alarm: number): AlarmState {
    const grblAlarmMap: { [key: number]: AlarmState } = {
      0: AlarmState.NoAlarm,
      1: AlarmState.HardLimit,
      2: AlarmState.SoftLimit,
      3: AlarmState.AbortCycle,
      4: AlarmState.ProbeFailInitial,
      5: AlarmState.ProbeFailContact,
      6: AlarmState.HomingFailReset,
      7: AlarmState.HomingFailDoor,
      8: AlarmState.FailPulloff,
      9: AlarmState.HomingFailApproach,
      10: AlarmState.SpindleControl,
      11: AlarmState.ControlPin,
      12: AlarmState.AmbiguousSwitch,
      13: AlarmState.HardStop,
      14: AlarmState.Unhomed,
      15: AlarmState.Init
    };

    return grblAlarmMap[alarm] || AlarmState.Unknown;
  }
}
