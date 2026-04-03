import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { LaserState } from '../types/Stores';

export enum CoolingMetric {
  InputFlow = 'inputFlow',
  OutputFlow = 'outputFlow',
  InputTemperature = 'inputTemperature',
  OutputTemperature = 'outputTemperature'
}

export interface MetricDataPoint {
  timestamp: number;
  value: number;
  isLaserRunning?: boolean;
}

type MetricData = Record<CoolingMetric, MetricDataPoint[]>;

interface HistoryPeriod {
  duration: number;
  interval: number;
  data: MetricData;
}

function createEmptyMetricData(): MetricData {
  return {
    [CoolingMetric.InputFlow]: [],
    [CoolingMetric.OutputFlow]: [],
    [CoolingMetric.InputTemperature]: [],
    [CoolingMetric.OutputTemperature]: [],
  };
}

export class CoolingHistoryStore {
  private _rootStore: RootStore;
  private _periods: HistoryPeriod[];
  private _updateIntervals: NodeJS.Timeout[];

  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
    this._periods = [
      { duration: 60 * 1000, interval: 1000, data: createEmptyMetricData() },      // 1mn period, 1s interval
      { duration: 5 * 60 * 1000, interval: 10000, data: createEmptyMetricData() }, // 5mn period, 10s interval
      { duration: 60 * 60 * 1000, interval: 60000, data: createEmptyMetricData() } // 60mn period, 1mn interval
    ];
    this._updateIntervals = [];

    makeAutoObservable(this, { getHistory: false }, { autoBind: true });
  }

  startTracking(): void {
    this.stopTracking();

    // Initialize data structures
    this._periods.forEach(period => {
      period.data = createEmptyMetricData();
    });

    // Setup update intervals
    this._periods.forEach(period => {
      const interval = setInterval(() => {
        const { coolingStore, laserStore } = this._rootStore;
        const now = Date.now();
        const isLaserRunning = laserStore.currentState === LaserState.Run;

        if (coolingStore.inputFlow !== undefined) {
          this.addDataPoint(CoolingMetric.InputFlow, coolingStore.inputFlow, now, period, isLaserRunning);
        }
        if (coolingStore.outputFlow !== undefined) {
          this.addDataPoint(CoolingMetric.OutputFlow, coolingStore.outputFlow, now, period, isLaserRunning);
        }
        if (coolingStore.inputTemperature !== undefined) {
          this.addDataPoint(CoolingMetric.InputTemperature, coolingStore.inputTemperature, now, period, isLaserRunning);
        }
        if (coolingStore.outputTemperature !== undefined) {
          this.addDataPoint(CoolingMetric.OutputTemperature, coolingStore.outputTemperature, now, period, isLaserRunning);
        }
      }, period.interval);

      this._updateIntervals.push(interval);
    });
  }

  stopTracking(): void {
    this._updateIntervals.forEach(interval => clearInterval(interval));
    this._updateIntervals = [];
    this._periods.forEach(period => {
      period.data = createEmptyMetricData();
    });
  }

  private addDataPoint(metric: CoolingMetric, value: number, timestamp: number, period: HistoryPeriod, isLaserRunning: boolean): void {
    const data = period.data[metric];
    if (!data) return;

    data.push({ timestamp, value, isLaserRunning });

    const cutoffTime = timestamp - period.duration;
    while (data.length > 0 && data[0].timestamp < cutoffTime) {
      data.shift();
    }
  }

  getHistory(metric: CoolingMetric, periodIndex: number): MetricDataPoint[] {
    const period = this._periods[periodIndex];
    if (!period) return [];
    return period.data[metric] || [];
  }
}

