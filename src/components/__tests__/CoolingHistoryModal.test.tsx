import { render, screen, fireEvent } from '@testing-library/react';
import { RootStore, RootStoreProvider } from '../../stores/RootStore';
import { CoolingMetric } from '../../stores/CoolingHistoryStore';
import CoolingHistoryModal from '../CoolingHistoryModal';
import { LaserState } from '../../types/Stores';
import { FC, act } from 'react';

// Mock Chart.js to avoid canvas rendering issues
jest.mock('chart.js');
jest.mock('react-chartjs-2', () => ({
  Line: (() => null) as FC<unknown>
}));

describe('CoolingHistoryModal', () => {
  let rootStore: RootStore;

  beforeEach(() => {
    jest.useFakeTimers();
    rootStore = new RootStore();

    // Setup the root store with some test data
    rootStore.settingsStore.updateSettings({
      probes: {
        cooling: {
          flow: { min: 5, max: 15 },
          temp: { min: 20, max: 30 }
        }
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const defaultProps = {
    show: true,
    onHide: jest.fn(),
    metric: CoolingMetric.InputFlow
  };

  const renderWithStore = (props = defaultProps) => {
    let result: ReturnType<typeof render>;
    act(() => {
      result = render(
        <RootStoreProvider value={rootStore}>
          <div id="root">
            <CoolingHistoryModal {...props} />
          </div>
        </RootStoreProvider>
      );
    });
    return result.container;
  };

  it('renders modal with correct title for input flow', () => {
    renderWithStore();
    expect(screen.getByText('Input Flow (L/min)')).toBeInTheDocument();
  });

  it('renders modal with correct title for input temperature', () => {
    renderWithStore({ ...defaultProps, metric: CoolingMetric.InputTemperature });
    expect(screen.getByText('Input Temperature (°C)')).toBeInTheDocument();
  });

  it('renders modal with correct title for output flow', () => {
    renderWithStore({ ...defaultProps, metric: CoolingMetric.OutputFlow });
    expect(screen.getByText('Output Flow (L/min)')).toBeInTheDocument();
  });

  it('renders modal with correct title for output temperature', () => {
    renderWithStore({ ...defaultProps, metric: CoolingMetric.OutputTemperature });
    expect(screen.getByText('Output Temperature (°C)')).toBeInTheDocument();
  });

  it('renders period selection buttons', () => {
    renderWithStore();
    expect(screen.getByText('1 minute')).toBeInTheDocument();
    expect(screen.getByText('5 minutes')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('changes period when clicking period buttons', () => {
    renderWithStore();

    const fiveMinButton = screen.getByText('5 minutes');
    act(() => {
      fireEvent.click(fiveMinButton);
    });

    // The button should now have the primary variant
    expect(fiveMinButton.closest('button')).toHaveClass('btn-primary');

    // Other buttons should have outline variant
    expect(screen.getByText('1 minute').closest('button')).toHaveClass('btn-outline-primary');
    expect(screen.getByText('1 hour').closest('button')).toHaveClass('btn-outline-primary');
  });

  it('calls onHide when close button is clicked', () => {
    renderWithStore();

    const closeButton = screen.getByLabelText('Close');
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(defaultProps.onHide).toHaveBeenCalled();
  });

  it('does not render when show is false', () => {
    renderWithStore({ ...defaultProps, show: false });
    expect(screen.queryByText('Input Flow (L/min)')).not.toBeInTheDocument();
  });

  it('updates chart data when laser state changes', async () => {
    renderWithStore();

    // Add some test data
    act(() => {
      rootStore.coolingStore.setInputFlow(10);
      rootStore.laserStore.setState(LaserState.Run);
    });

    // Advance timers to trigger data collection
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const data = rootStore.coolingHistoryStore.getHistory(CoolingMetric.InputFlow, 0);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].isLaserRunning).toBe(true);
  });
});

