import { IncomingMessageType, IncomingMessage, StatusReportPayload, GrblReportPayload, GrblMessagePayload, GrblAckPayload } from '../types/Messages';
import { ControllerSettings } from '../types/Settings';
import { RootStore } from '../stores/RootStore';
import { LaserState, LidState, FlameSensorStatus, UartStatus , PositionType, AlarmState } from '../types/Stores';
import { IMessageHandlerService } from './interfaces/IMessageHandlerService';
import { useCommandTrackingState } from '../hooks/useCommandTracking';

const GRBL_STATE_MAP: { [key: number]: LaserState } = {
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

const GRBL_ALARM_MAP: { [key: number]: AlarmState } = {
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

const UART_STATUS_MAP: { [key: number]: UartStatus } = {
  0: UartStatus.Unknown,
  1: UartStatus.Connected,
  2: UartStatus.Disconnected
};

export class MessageHandlerService implements IMessageHandlerService {
  private commandTracking?: ReturnType<typeof useCommandTrackingState>;

  constructor(private store: RootStore) {
  }

  setCommandTracking(commandTracking: ReturnType<typeof useCommandTrackingState>) {
    this.commandTracking = commandTracking;
  }

  handleMessage(message: IncomingMessage): void {
    switch (message.t) {
      case IncomingMessageType.StatusReport:
        this.handleStatusReport(message.p);
        break;
      case IncomingMessageType.GrblReport:
        this.handleGrblReport(message.p);
        break;
      case IncomingMessageType.GrblMessage:
        this.handleGrblMessage(message.p);
        break;
      case IncomingMessageType.GrblAck:
        this.handleGrblAck(message.p);
        break;
      case IncomingMessageType.ControllerSettings:
        this.handleControllerSettings(message.p);
        break;
      default:
        console.warn('Unknown incoming message type:', (message as { t: unknown }).t);
        break;
    }
  }

  private handleStatusReport(payload: StatusReportPayload): void {
    const { laserStore, lidsStore, coolingStore, systemStore } = this.store;

    coolingStore.setInputFlow(payload.sensors.cooling.flow.in);
    coolingStore.setOutputFlow(payload.sensors.cooling.flow.out);
    coolingStore.setInputTemperature(payload.sensors.cooling.temp.in);
    coolingStore.setOutputTemperature(payload.sensors.cooling.temp.out);

    lidsStore.setFrontLidState(payload.sensors.lids.front === 'opened' ? LidState.Opened : LidState.Closed);
    lidsStore.setBackLidState(payload.sensors.lids.back === 'opened' ? LidState.Opened : LidState.Closed);

    systemStore.setFlameSensorStatus(
      payload.sensors.flame_sensor === 'triggered'
      ? FlameSensorStatus.Triggered
      : FlameSensorStatus.OK
    );

    systemStore.setUartStatus(UART_STATUS_MAP[payload.uart] || UartStatus.Unknown);

    laserStore.setInterlock(payload.relays.interlock);
    laserStore.setLights(payload.relays.lights);
    laserStore.setAccessory(payload.relays.accessory);
    laserStore.setAirAssist(payload.relays.air_assist);
  }

  private handleGrblReport(payload: GrblReportPayload): void {
    const { laserStore } = this.store;

    if (payload.state !== undefined) {
      laserStore.setState(GRBL_STATE_MAP[payload.state] || LaserState.Unknown);
    }

    if (payload.alarm !== undefined) {
      laserStore.setAlarm(GRBL_ALARM_MAP[payload.alarm] || AlarmState.Unknown);
    }

    if (payload.w_pos) {
      laserStore.setPosition(PositionType.Work, payload.w_pos);
    }

    if (payload.m_pos) {
      laserStore.setPosition(PositionType.Machine, payload.m_pos);
    }

    if (payload.wco) {
      laserStore.setPosition(PositionType.Offset, payload.wco);
    }

    if (payload.feed?.rate !== undefined) {
      laserStore.setSpeed(payload.feed.rate);
    }

    if (payload.active_pins) {
      laserStore.setActivePins(payload.active_pins);
    }
  }

  private handleGrblMessage(payload: GrblMessagePayload): void {
    if (payload.message.toLowerCase().startsWith('error:')) {
      const errorMessage = payload.message.replace(/^error:\s*/i, '');
      this.store.toastStore.show(
        'Grbl Error',
        errorMessage,
        'danger'
      );
    }
  }

  private handleGrblAck(payload: GrblAckPayload): void {
    this.commandTracking?.handleCommandAck(payload.id, payload.success);
  }

  private handleControllerSettings(settings: ControllerSettings): void {
    this.store.settingsStore.updateSettings(settings, false);
    this.store.settingsStore.setIsLoaded(true);
  }
}
