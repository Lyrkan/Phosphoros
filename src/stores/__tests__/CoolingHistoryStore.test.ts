import { CoolingHistoryStore, CoolingMetric } from '../CoolingHistoryStore';
import { RootStore } from '../RootStore';
import { LaserState } from '../../types/Stores';

jest.useFakeTimers();

describe('CoolingHistoryStore', () => {
  let rootStore: RootStore;
  let coolingHistoryStore: CoolingHistoryStore;

  beforeEach(() => {
    rootStore = new RootStore();
    coolingHistoryStore = new CoolingHistoryStore(rootStore);
  });

  afterEach(() => {
    coolingHistoryStore.stopTracking();
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with empty data', () => {
      expect(coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 0)).toEqual([]);
      expect(coolingHistoryStore.getHistory(CoolingMetric.OutputFlow, 0)).toEqual([]);
      expect(coolingHistoryStore.getHistory(CoolingMetric.InputTemperature, 0)).toEqual([]);
      expect(coolingHistoryStore.getHistory(CoolingMetric.OutputTemperature, 0)).toEqual([]);
    });
  });

  describe('startTracking', () => {
    it('should initialize data structures for all metrics', () => {
      coolingHistoryStore.startTracking();

      // Check all periods and metrics
      [0, 1, 2].forEach(periodIndex => {
        Object.values(CoolingMetric).forEach(metric => {
          expect(coolingHistoryStore.getHistory(metric, periodIndex)).toEqual([]);
        });
      });
    });

    it('should set up intervals to collect data', () => {
      const mockDate = new Date(2024, 0, 1, 12, 0, 0);
      jest.setSystemTime(mockDate);

      rootStore.coolingStore.setInputFlow(2.5);
      rootStore.coolingStore.setOutputFlow(2.0);
      rootStore.coolingStore.setInputTemperature(20.0);
      rootStore.coolingStore.setOutputTemperature(22.0);
      rootStore.laserStore.setState(LaserState.Run);

      coolingHistoryStore.startTracking();

      // Advance time by 1 second (first period interval)
      jest.advanceTimersByTime(1000);

      // Check that data was collected for the first period
      const firstPeriodData = coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 0);
      expect(firstPeriodData).toHaveLength(1);
      expect(firstPeriodData[0]).toEqual({
        timestamp: mockDate.getTime() + 1000,
        value: 2.5,
        isLaserRunning: true
      });
    });

    it('should clear previous data when restarting tracking', () => {
      const mockDate = new Date(2024, 0, 1, 12, 0, 0);
      jest.setSystemTime(mockDate);

      rootStore.coolingStore.setInputFlow(2.5);
      coolingHistoryStore.startTracking();
      jest.advanceTimersByTime(1000);

      // Restart tracking
      coolingHistoryStore.startTracking();

      // Check that previous data was cleared
      Object.values(CoolingMetric).forEach(metric => {
        expect(coolingHistoryStore.getHistory(metric, 0)).toEqual([]);
      });
    });
  });

  describe('stopTracking', () => {
    it('should clear all data and intervals', () => {
      coolingHistoryStore.startTracking();
      rootStore.coolingStore.setInputFlow(2.5);
      jest.advanceTimersByTime(1000);

      coolingHistoryStore.stopTracking();

      // Check that data was cleared
      Object.values(CoolingMetric).forEach(metric => {
        expect(coolingHistoryStore.getHistory(metric, 0)).toEqual([]);
      });
    });
  });

  describe('data collection', () => {
    it('should only keep data within the period duration', () => {
      const mockDate = new Date(2024, 0, 1, 12, 0, 0);
      jest.setSystemTime(mockDate);

      rootStore.coolingStore.setInputFlow(2.5);
      coolingHistoryStore.startTracking();

      // Add data points for 70 seconds (more than the 60s period)
      for (let i = 0; i < 70; i++) {
        jest.advanceTimersByTime(1000);
      }

      // Should only keep the last 60 data points for the first period
      const firstPeriodData = coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 0);
      expect(firstPeriodData).toHaveLength(61);

      // First point should be from 10 seconds after start
      expect(firstPeriodData[0].timestamp).toBe(mockDate.getTime() + 10000);
    });

    it('should handle undefined sensor values', () => {
      coolingHistoryStore.startTracking();

      // Don't set any sensor values
      jest.advanceTimersByTime(1000);

      // Check that no data points were added
      Object.values(CoolingMetric).forEach(metric => {
        expect(coolingHistoryStore.getHistory(metric, 0)).toEqual([]);
      });
    });
  });

  describe('getHistory', () => {
    it('should return empty array for invalid period index', () => {
      expect(coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 999)).toEqual([]);
    });

    it('should return correct data for each period', () => {
      const mockDate = new Date(2024, 0, 1, 12, 0, 0);
      jest.setSystemTime(mockDate);

      rootStore.coolingStore.setInputFlow(2.5);
      coolingHistoryStore.startTracking();

      // Advance time to collect data in different periods
      jest.advanceTimersByTime(1000);  // 1s period
      jest.advanceTimersByTime(10000); // 10s period
      jest.advanceTimersByTime(60000); // 1min period

      // Check data in each period
      expect(coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 0)).toHaveLength(61);
      expect(coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 1)).toHaveLength(7);
      expect(coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 2)).toHaveLength(1);
    });
  });
});

