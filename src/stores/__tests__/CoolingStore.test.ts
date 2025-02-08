import { CoolingStore } from '../CoolingStore';

describe('CoolingStore', () => {
  let store: CoolingStore;

  beforeEach(() => {
    store = new CoolingStore();
  });

  describe('initialization', () => {
    it('should initialize with undefined values', () => {
      expect(store.inputFlow).toBeUndefined();
      expect(store.outputFlow).toBeUndefined();
      expect(store.inputTemperature).toBeUndefined();
      expect(store.outputTemperature).toBeUndefined();
    });
  });

  describe('flow management', () => {
    it('should update input flow', () => {
      store.setInputFlow(2.5);
      expect(store.inputFlow).toBe(2.5);
    });

    it('should update output flow', () => {
      store.setOutputFlow(2.0);
      expect(store.outputFlow).toBe(2.0);
    });

    it('should handle zero flow values', () => {
      store.setInputFlow(0);
      store.setOutputFlow(0);
      expect(store.inputFlow).toBe(0);
      expect(store.outputFlow).toBe(0);
    });

    it('should handle negative flow values', () => {
      store.setInputFlow(-1);
      store.setOutputFlow(-1);
      expect(store.inputFlow).toBe(-1);
      expect(store.outputFlow).toBe(-1);
    });
  });

  describe('temperature management', () => {
    it('should update input temperature', () => {
      store.setInputTemperature(20.5);
      expect(store.inputTemperature).toBe(20.5);
    });

    it('should update output temperature', () => {
      store.setOutputTemperature(22.0);
      expect(store.outputTemperature).toBe(22.0);
    });

    it('should handle zero temperature values', () => {
      store.setInputTemperature(0);
      store.setOutputTemperature(0);
      expect(store.inputTemperature).toBe(0);
      expect(store.outputTemperature).toBe(0);
    });

    it('should handle negative temperature values', () => {
      store.setInputTemperature(-10);
      store.setOutputTemperature(-5);
      expect(store.inputTemperature).toBe(-10);
      expect(store.outputTemperature).toBe(-5);
    });
  });

  describe('value updates', () => {
    it('should allow updating all values in sequence', () => {
      store.setInputFlow(2.5);
      store.setOutputFlow(2.0);
      store.setInputTemperature(20.0);
      store.setOutputTemperature(22.0);

      expect(store.inputFlow).toBe(2.5);
      expect(store.outputFlow).toBe(2.0);
      expect(store.inputTemperature).toBe(20.0);
      expect(store.outputTemperature).toBe(22.0);
    });

    it('should handle decimal precision', () => {
      store.setInputFlow(2.123);
      store.setOutputFlow(2.456);
      store.setInputTemperature(20.789);
      store.setOutputTemperature(22.012);

      expect(store.inputFlow).toBe(2.123);
      expect(store.outputFlow).toBe(2.456);
      expect(store.inputTemperature).toBe(20.789);
      expect(store.outputTemperature).toBe(22.012);
    });
  });
});
