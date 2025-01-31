import { MessageHandlerService } from '../MessageHandlerService';
import { RootStore } from '../../stores/RootStore';
import { IncomingMessageType } from '../../types/Messages';
import { LaserState, LidState, FlameSensorStatus, AlarmState } from '../../types/Stores';

describe('MessageHandlerService', () => {
  let rootStore: RootStore;
  let messageHandler: MessageHandlerService;

  beforeEach(() => {
    rootStore = new RootStore();
    messageHandler = new MessageHandlerService(rootStore);
  });

  afterEach(() => {
    rootStore.settingsStore.cleanup();
    rootStore.coolingHistoryStore.stopTracking();
  });

  describe('handleStatusReport', () => {
    it('should update cooling store values', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.StatusReport,
        p: {
          sensors: {
            cooling: {
              flow: { in: 2.5, out: 3.0 },
              temp: { in: 25.5, out: 28.0 }
            },
            lids: { front: 'closed', back: 'closed' },
            flame_sensor: 'ok'
          },
          alerts: {
            cooling: false,
            lids: false,
            flame_sensor: false
          },
          relays: {
            interlock: true,
            alarm: false,
            light: true,
            beam_preview: false
          },
          uart: 1
        }
      });

      expect(rootStore.coolingStore.inputFlow).toBe(2.5);
      expect(rootStore.coolingStore.outputFlow).toBe(3.0);
      expect(rootStore.coolingStore.inputTemperature).toBe(25.5);
      expect(rootStore.coolingStore.outputTemperature).toBe(28.0);
    });

    it('should update lid states correctly', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.StatusReport,
        p: {
          sensors: {
            cooling: {
              flow: { in: 0, out: 0 },
              temp: { in: 0, out: 0 }
            },
            lids: { front: 'opened', back: 'closed' },
            flame_sensor: 'ok'
          },
          alerts: {
            cooling: false,
            lids: false,
            flame_sensor: false
          },
          relays: {
            interlock: false,
            alarm: false,
            light: false,
            beam_preview: false
          },
          uart: 1
        }
      });

      expect(rootStore.lidsStore.frontLidState).toBe(LidState.Opened);
      expect(rootStore.lidsStore.backLidState).toBe(LidState.Closed);
    });

    it('should update flame sensor status', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.StatusReport,
        p: {
          sensors: {
            cooling: {
              flow: { in: 0, out: 0 },
              temp: { in: 0, out: 0 }
            },
            lids: { front: 'closed', back: 'closed' },
            flame_sensor: 'triggered'
          },
          alerts: {
            cooling: false,
            lids: false,
            flame_sensor: true
          },
          relays: {
            interlock: false,
            alarm: false,
            light: false,
            beam_preview: false
          },
          uart: 1
        }
      });

      expect(rootStore.systemStore.flameSensorStatus).toBe(FlameSensorStatus.Triggered);
    });
  });

  describe('handleGrblReport', () => {
    it('should update laser state and position', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.GrblReport,
        p: {
          state: 1,
          alarm: 2,
          w_pos: { x: 10, y: 20, z: 30 },
          m_pos: { x: 100, y: 200, z: 300 },
          wco: { x: 90, y: 180, z: 270 },
          feed: { rate: 1000, spindle_speed: 0 }
        }
      });

      expect(rootStore.laserStore.currentState).toBe(LaserState.Idle);
      expect(rootStore.laserStore.currentAlarm).toBe(AlarmState.SoftLimit);
      expect(rootStore.laserStore.workPosition).toEqual({ x: 10, y: 20, z: 30 });
      expect(rootStore.laserStore.machinePosition).toEqual({ x: 100, y: 200, z: 300 });
      expect(rootStore.laserStore.workOffset).toEqual({ x: 90, y: 180, z: 270 });
      expect(rootStore.laserStore.speed).toBe(1000);
    });

    it('should handle partial updates', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.GrblReport,
        p: {
          state: 2,
          w_pos: { x: 15, y: 25, z: 35 }
        }
      });

      expect(rootStore.laserStore.currentState).toBe(LaserState.Run);
      expect(rootStore.laserStore.workPosition).toEqual({ x: 15, y: 25, z: 35 });
      // Other values should remain at their defaults
      expect(rootStore.laserStore.speed).toBe(0);
    });
  });

  describe('handleControllerSettings', () => {
    it('should update settings store', () => {
      const settings = {
        bed: {
          control_mode: 1,
          screw_lead_um: 8000
        },
        probes: {
          cooling: {
            flow: {
              min: 1.5,
              max: 5.0
            }
          }
        }
      };

      messageHandler.handleMessage({
        t: IncomingMessageType.ControllerSettings,
        p: settings
      });

      expect(rootStore.settingsStore.bed.control_mode).toBe(1);
      expect(rootStore.settingsStore.bed.screw_lead_um).toBe(8000);
      expect(rootStore.settingsStore.probes.cooling?.flow?.min).toBe(1.5);
      expect(rootStore.settingsStore.probes.cooling?.flow?.max).toBe(5.0);
    });
  });

  describe('mapGrblState', () => {
    it('should map known states correctly', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.GrblReport,
        p: { state: 1 }
      });
      expect(rootStore.laserStore.currentState).toBe(LaserState.Idle);

      messageHandler.handleMessage({
        t: IncomingMessageType.GrblReport,
        p: { state: 6 }
      });
      expect(rootStore.laserStore.currentState).toBe(LaserState.Alarm);
    });

    it('should return Unknown for invalid states', () => {
      messageHandler.handleMessage({
        t: IncomingMessageType.GrblReport,
        p: { state: 999 }
      });
      expect(rootStore.laserStore.currentState).toBe(LaserState.Unknown);
    });
  });
});
