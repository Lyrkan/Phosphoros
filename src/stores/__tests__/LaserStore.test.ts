import { LaserStore, ActivePins } from '../LaserStore';
import { LaserState, AlarmState, PositionType, Position } from '../../types/Stores';

describe('LaserStore', () => {
  let store: LaserStore;

  beforeEach(() => {
    store = new LaserStore();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.currentState).toBe(LaserState.Unknown);
      expect(store.currentAlarm).toBe(AlarmState.Unknown);
      expect(store.speed).toBe(0);
      expect(store.workPosition).toEqual({ x: 0, y: 0, z: 0 });
      expect(store.machinePosition).toEqual({ x: 0, y: 0, z: 0 });
      expect(store.workOffset).toEqual({ x: 0, y: 0, z: 0 });
      expect(store.interlock).toBeUndefined();
      expect(store.lights).toBeUndefined();
      expect(store.airAssist).toBeUndefined();
      expect(store.accessory).toBeUndefined();
      expect(store.activePins).toEqual({
        x: false,
        y: false,
        z: false,
        p: false,
        d: false,
        h: false,
        r: false,
        s: false
      });
    });
  });

  describe('state management', () => {
    it('should update laser state', () => {
      store.setState(LaserState.Run);
      expect(store.currentState).toBe(LaserState.Run);
    });

    it('should update alarm state', () => {
      store.setAlarm(AlarmState.SoftLimit);
      expect(store.currentAlarm).toBe(AlarmState.SoftLimit);
    });

    it('should update speed', () => {
      store.setSpeed(1000);
      expect(store.speed).toBe(1000);
    });
  });

  describe('position management', () => {
    const testPosition: Position = { x: 10, y: 20, z: -5 };

    it('should update work position', () => {
      store.setWorkPosition(testPosition);
      expect(store.workPosition).toEqual(testPosition);
    });

    it('should update machine position', () => {
      store.setPosition(PositionType.Machine, testPosition);
      expect(store.machinePosition).toEqual(testPosition);
    });

    it('should update work offset', () => {
      store.setPosition(PositionType.Offset, testPosition);
      expect(store.workOffset).toEqual(testPosition);
    });

    it('should handle all position types correctly', () => {
      const positions = {
        [PositionType.Work]: { x: 1, y: 2, z: 3 },
        [PositionType.Machine]: { x: 4, y: 5, z: 6 },
        [PositionType.Offset]: { x: 7, y: 8, z: 9 }
      };

      Object.entries(positions).forEach(([type, position]) => {
        store.setPosition(type as PositionType, position);
      });

      expect(store.workPosition).toEqual(positions[PositionType.Work]);
      expect(store.machinePosition).toEqual(positions[PositionType.Machine]);
      expect(store.workOffset).toEqual(positions[PositionType.Offset]);
    });
  });

  describe('relay states', () => {
    it('should update interlock state', () => {
      store.setInterlock(true);
      expect(store.interlock).toBe(true);
    });

    it('should update lights state', () => {
      store.setLights(true);
      expect(store.lights).toBe(true);
    });

    it('should update air assist state', () => {
      store.setAirAssist(true);
      expect(store.airAssist).toBe(true);
    });

    it('should update accessory state', () => {
      store.setAccessory(true);
      expect(store.accessory).toBe(true);
    });
  });

  describe('active pins', () => {
    it('should update active pins partially', () => {
      const partialPins: Partial<ActivePins> = {
        x: true,
        y: true
      };

      store.setActivePins(partialPins);

      expect(store.activePins).toEqual({
        x: true,
        y: true,
        z: false,
        p: false,
        d: false,
        h: false,
        r: false,
        s: false
      });
    });

    it('should update all active pins', () => {
      const allPins: ActivePins = {
        x: true,
        y: true,
        z: true,
        p: true,
        d: true,
        h: true,
        r: true,
        s: true
      };

      store.setActivePins(allPins);
      expect(store.activePins).toEqual(allPins);
    });

    it('should maintain existing pin states when updating partially', () => {
      // Set initial state
      store.setActivePins({ x: true, y: true });

      // Update only one pin
      store.setActivePins({ z: true });

      expect(store.activePins).toEqual({
        x: true,
        y: true,
        z: true,
        p: false,
        d: false,
        h: false,
        r: false,
        s: false
      });
    });
  });
});
