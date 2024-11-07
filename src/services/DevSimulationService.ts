import { RootStore } from '../stores/RootStore';
import { LaserState, AlarmState, LidState, FlameSensorStatus, UartStatus } from '../types/Stores';

/*
 * This service is used to simulate the machine state for development purposes.
 * It should not be enabled in production builds.
 */
export class DevSimulationService {
  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  start() {
    if (!globalThis.isDev) return;

    // Init fake settings
    this.rootStore.settingsStore.updateSettings({
      probes: {
        cooling: {
          flow: {
            min: 1,
            max: 3.2
          },
          temp: {
            min: 15,
            max: 25
          }
        }
      }
    });

    setInterval(() => this.updateValues(), 500);
  }

  private randomFloat(min: number, max: number): number {
    return Number((Math.random() * (max - min) + min).toFixed(1));
  }

  private randomChance(probability: number): boolean {
    return Math.random() < probability;
  }

  private updateValues() {
    const { laserStore, coolingStore, lidsStore, systemStore } = this.rootStore;

    // Simulate cooling values with small variations
    coolingStore.setInputFlow(Math.max(0.5, (coolingStore.inputFlow || 3) + this.randomFloat(-0.1, 0.1)));
    coolingStore.setOutputFlow(Math.min(coolingStore.inputFlow, (coolingStore.outputFlow || 3) + this.randomFloat(-0.1, 0.1)));
    coolingStore.setInputTemperature(Math.max(19, (coolingStore.inputTemperature || 19) + this.randomFloat(-0.1, 0.1)));
    coolingStore.setOutputTemperature(Math.max(coolingStore.inputTemperature, (coolingStore.outputTemperature || 19) + this.randomFloat(-0.1, 0.1)));

    // Occasionally simulate lid opening (5% chance)
    if (this.randomChance(0.05)) {
      lidsStore.setFrontLidState(LidState.Opened);
    } else {
      lidsStore.setFrontLidState(LidState.Closed);
    }
    lidsStore.setBackLidState(LidState.Closed);

    // Simulate laser states
    if (laserStore.currentState === LaserState.Idle && this.randomChance(0.05)) {
      laserStore.setState(LaserState.Run);
    } else if (laserStore.currentState === LaserState.Run && this.randomChance(0.05)) {
      laserStore.setState(LaserState.Idle);
    } else if (laserStore.currentState !== LaserState.Run) {
      laserStore.setState(LaserState.Idle);
    }

    // Very rarely simulate alarms
    if (laserStore.currentAlarm === AlarmState.NoAlarm && this.randomChance(0.05)) {
      laserStore.setAlarm(AlarmState.SoftLimit);
    } else if (laserStore.currentAlarm === AlarmState.SoftLimit && this.randomChance(0.2)) {
      laserStore.setAlarm(AlarmState.NoAlarm);
    } else if (laserStore.currentAlarm !== AlarmState.SoftLimit) {
      laserStore.setAlarm(AlarmState.NoAlarm);
    }

    // Update positions with small movements
    laserStore.setWorkPosition({
      x: this.randomFloat(-50, 50),
      y: this.randomFloat(-50, 50),
      z: this.randomFloat(-5, 0)
    });

    // Simulate system statuses
    systemStore.setFlameSensorStatus(this.randomChance(0.02) ?
      FlameSensorStatus.Triggered : FlameSensorStatus.OK);

    systemStore.setUartStatus(this.randomChance(0.01) ?
      UartStatus.Error : UartStatus.Connected);

    // Simulate relay states
    laserStore.setInterlock(this.randomChance(0.95));
  }
}
