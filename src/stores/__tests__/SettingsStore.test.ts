import { SettingsStore } from '../SettingsStore';
import { ToastStore } from '../ToastStore';
import { BedControlMode, ControllerSettings } from '../../types/Settings';
import { ISerialService } from '../../services/interfaces/ISerialService';
import { OutgoingMessageType } from '../../types/Messages';

jest.useFakeTimers();

describe('SettingsStore', () => {
  let store: SettingsStore;
  let toastStore: ToastStore;
  let mockSerialService: jest.Mocked<ISerialService>;

  beforeEach(() => {
    toastStore = new ToastStore();
    store = new SettingsStore(toastStore);
    mockSerialService = {
      sendCommand: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<ISerialService>;
  });

  afterEach(() => {
    store.cleanup();
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.bed).toEqual({ control_mode: BedControlMode.Grbl });
      expect(store.probes).toEqual({});
      expect(store.ota).toEqual({});
      expect(store.grbl).toEqual({});
      expect(store.relays).toEqual({});
      expect(store.isLoaded).toBe(false);
    });
  });

  describe('serial service management', () => {
    it('should set serial service', () => {
      store.setSerialService(mockSerialService);

      // Update settings to trigger serial service usage
      store.updateSettings({ grbl: { jog_speed: 1000 } });
      jest.advanceTimersByTime(1000);

      expect(mockSerialService.sendCommand).toHaveBeenCalledWith(
        OutgoingMessageType.SettingsSet,
        { grbl: { jog_speed: 1000 } }
      );
    });
  });

  describe('settings updates', () => {
    beforeEach(() => {
      store.setSerialService(mockSerialService);
    });

    it('should update bed settings', () => {
      const bedSettings = { control_mode: BedControlMode.Stepper };
      store.updateSettings({ bed: bedSettings });
      expect(store.bed).toEqual(bedSettings);
    });

    it('should update probe settings', () => {
      const probeSettings = {
        cooling: {
          flow: { min: 1, max: 3.2 },
          temp: { min: 15, max: 25 }
        }
      };
      store.updateSettings({ probes: probeSettings });
      expect(store.probes).toEqual(probeSettings);
    });

    it('should update OTA settings', () => {
      const otaSettings = { login: 'user', password: 'pass' };
      store.updateSettings({ ota: otaSettings });
      expect(store.ota).toEqual(otaSettings);
    });

    it('should update GRBL settings', () => {
      const grblSettings = {
        jog_speed: 1000,
        default_timeout_ms: 2000,
        homing_timeout_ms: 5000
      };
      store.updateSettings({ grbl: grblSettings });
      expect(store.grbl).toEqual(grblSettings);
    });

    it('should update relay settings', () => {
      const relaySettings = {
        alarm_behavior: 1,
        interlock_behavior: 2
      };
      store.updateSettings({ relays: relaySettings });
      expect(store.relays).toEqual(relaySettings);
    });

    it('should handle partial updates', () => {
      // Initial update
      store.updateSettings({
        grbl: { jog_speed: 1000, default_timeout_ms: 2000 }
      });

      // Partial update
      store.updateSettings({
        grbl: { jog_speed: 1500 }
      });

      expect(store.grbl).toEqual({
        jog_speed: 1500,
        default_timeout_ms: 2000
      });
    });

    it('should debounce updates to serial service', () => {
      store.updateSettings({ grbl: { jog_speed: 1000 } });
      store.updateSettings({ grbl: { jog_speed: 1500 } });
      store.updateSettings({ grbl: { jog_speed: 2000 } });

      expect(mockSerialService.sendCommand).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(mockSerialService.sendCommand).toHaveBeenCalledTimes(1);
      expect(mockSerialService.sendCommand).toHaveBeenCalledWith(
        OutgoingMessageType.SettingsSet,
        { grbl: { jog_speed: 2000 } }
      );
    });

    it('should not send update when sendUpdate is false', () => {
      store.updateSettings({ grbl: { jog_speed: 1000 } }, false);
      jest.advanceTimersByTime(1000);
      expect(mockSerialService.sendCommand).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should show toast on serial service error', async () => {
      const spyShow = jest.spyOn(toastStore, 'show');
      store.setSerialService(mockSerialService);
      mockSerialService.sendCommand.mockRejectedValueOnce(new Error('Connection failed'));

      store.updateSettings({ grbl: { jog_speed: 1000 } });
      jest.advanceTimersByTime(1000);

      // Wait for the promise to resolve
      await Promise.resolve();

      expect(spyShow).toHaveBeenCalledWith(
        'Settings Update Failed',
        'Failed to send settings update to the controller: Connection failed',
        'danger'
      );
    });

    it('should show toast when serial service is not initialized', async () => {
      const spyShow = jest.spyOn(toastStore, 'show');

      store.updateSettings({ grbl: { jog_speed: 1000 } });
      jest.advanceTimersByTime(1000);

      // Wait for the promise to resolve
      await Promise.resolve();

      expect(spyShow).toHaveBeenCalledWith(
        'Settings Update Failed',
        'Failed to send settings update to the controller: Serial service not initialized',
        'danger'
      );
    });
  });

  describe('deep merge behavior', () => {
    it('should merge nested objects correctly', () => {
      const initialSettings: ControllerSettings = {
        probes: {
          cooling: {
            flow: { min: 1, max: 3 },
            temp: { min: 15, max: 25 }
          }
        }
      };

      const updateSettings: ControllerSettings = {
        probes: {
          cooling: {
            flow: { min: 2 }
          }
        }
      };

      store.updateSettings(initialSettings, false);
      store.updateSettings(updateSettings, false);

      expect(store.probes).toEqual({
        cooling: {
          flow: { min: 2, max: 3 },
          temp: { min: 15, max: 25 }
        }
      });
    });

    it('should handle undefined values in source', () => {
      store.updateSettings({
        probes: {
          cooling: {
            flow: { min: 1, max: 3 }
          }
        }
      }, false);

      store.updateSettings({
        probes: {
          cooling: {
            flow: { min: undefined, max: 4 }
          }
        }
      }, false);

      expect(store.probes).toEqual({
        cooling: {
          flow: { min: 1, max: 4 }
        }
      });
    });
  });

  describe('cleanup', () => {
    it('should clear update timeout', () => {
      store.setSerialService(mockSerialService);
      store.updateSettings({ grbl: { jog_speed: 1000 } });

      store.cleanup();
      jest.advanceTimersByTime(1000);

      expect(mockSerialService.sendCommand).not.toHaveBeenCalled();
    });
  });
});

