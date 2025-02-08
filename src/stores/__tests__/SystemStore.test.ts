import { SystemStore } from '../SystemStore';
import { FlameSensorStatus, UartStatus } from '../../types/Stores';

describe('SystemStore', () => {
  let store: SystemStore;

  beforeEach(() => {
    store = new SystemStore();
  });

  describe('initialization', () => {
    it('should initialize with unknown states', () => {
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Unknown);
      expect(store.uartStatus).toBe(UartStatus.Unknown);
    });
  });

  describe('flame sensor status management', () => {
    it('should update flame sensor status to OK', () => {
      store.setFlameSensorStatus(FlameSensorStatus.OK);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.OK);
    });

    it('should update flame sensor status to Triggered', () => {
      store.setFlameSensorStatus(FlameSensorStatus.Triggered);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Triggered);
    });

    it('should update flame sensor status to Unknown', () => {
      store.setFlameSensorStatus(FlameSensorStatus.Unknown);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Unknown);
    });

    it('should handle multiple status transitions', () => {
      store.setFlameSensorStatus(FlameSensorStatus.OK);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.OK);

      store.setFlameSensorStatus(FlameSensorStatus.Triggered);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Triggered);

      store.setFlameSensorStatus(FlameSensorStatus.Unknown);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Unknown);
    });
  });

  describe('UART status management', () => {
    it('should update UART status to Connected', () => {
      store.setUartStatus(UartStatus.Connected);
      expect(store.uartStatus).toBe(UartStatus.Connected);
    });

    it('should update UART status to Disconnected', () => {
      store.setUartStatus(UartStatus.Disconnected);
      expect(store.uartStatus).toBe(UartStatus.Disconnected);
    });

    it('should update UART status to Unknown', () => {
      store.setUartStatus(UartStatus.Unknown);
      expect(store.uartStatus).toBe(UartStatus.Unknown);
    });

    it('should handle multiple status transitions', () => {
      store.setUartStatus(UartStatus.Connected);
      expect(store.uartStatus).toBe(UartStatus.Connected);

      store.setUartStatus(UartStatus.Disconnected);
      expect(store.uartStatus).toBe(UartStatus.Disconnected);

      store.setUartStatus(UartStatus.Unknown);
      expect(store.uartStatus).toBe(UartStatus.Unknown);
    });
  });

  describe('independent status updates', () => {
    it('should handle independent status changes', () => {
      store.setFlameSensorStatus(FlameSensorStatus.OK);
      store.setUartStatus(UartStatus.Connected);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.OK);
      expect(store.uartStatus).toBe(UartStatus.Connected);

      store.setFlameSensorStatus(FlameSensorStatus.Triggered);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Triggered);
      expect(store.uartStatus).toBe(UartStatus.Connected);

      store.setUartStatus(UartStatus.Disconnected);
      expect(store.flameSensorStatus).toBe(FlameSensorStatus.Triggered);
      expect(store.uartStatus).toBe(UartStatus.Disconnected);
    });
  });
});
