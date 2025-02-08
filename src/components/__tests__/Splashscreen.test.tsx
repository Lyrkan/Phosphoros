import { render, screen, fireEvent, act } from '@testing-library/react';
import { SerialServiceContextProvider } from '../../contexts/SerialServiceContext';
import { useStore } from '../../stores/RootStore';
import { UartStatus } from '../../types/Stores';
import { OutgoingMessage, OutgoingMessageType } from '../../types/Messages';
import Splashscreen from '../Splashscreen';

// Mock the stores
jest.mock('../../stores/RootStore', () => ({
  useStore: jest.fn()
}));

// Mock the environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    GIT_COMMIT_HASH: 'test-hash',
    BUILD_DATE: '2024-01-01T12:00:00'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock the serial service
const mockSerialService = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  sendCommand: jest.fn<Promise<OutgoingMessage>, [OutgoingMessageType, unknown]>()
};

const mockStore = {
  serialStore: {
    connectionState: UartStatus.Disconnected,
    error: null as string | null
  },
  settingsStore: {
    isLoaded: false,
    setIsLoaded: jest.fn()
  }
};

describe('Splashscreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as jest.Mock).mockReturnValue(mockStore);
  });

  const renderSplashscreen = () => {
    return render(
      <SerialServiceContextProvider value={mockSerialService}>
        <Splashscreen />
      </SerialServiceContextProvider>
    );
  };

  it('renders loading state initially', () => {
    renderSplashscreen();
    expect(screen.getByText('Please connect to continue')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('shows error state when connection fails', () => {
    (useStore as jest.Mock).mockReturnValue({
      ...mockStore,
      serialStore: {
        connectionState: UartStatus.Error,
        error: 'Connection failed'
      }
    });

    renderSplashscreen();
    expect(screen.getByText('Connection failed: Connection failed')).toBeInTheDocument();
    expect(screen.getByText('Retry Connection')).toBeInTheDocument();
  });

  it('shows connected state when settings are loaded', () => {
    (useStore as jest.Mock).mockReturnValue({
      ...mockStore,
      serialStore: {
        connectionState: UartStatus.Connected,
        error: null
      },
      settingsStore: {
        isLoaded: true,
        setIsLoaded: jest.fn()
      }
    });

    renderSplashscreen();
    expect(screen.getByText('Connected successfully!')).toBeInTheDocument();
  });

  it('shows skip button after timeout', async () => {
    jest.useFakeTimers();
    renderSplashscreen();

    expect(screen.queryByText('Skip Loading')).not.toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Skip Loading')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('handles connect button click', () => {
    renderSplashscreen();
    const connectButton = screen.getByText('Connect');
    fireEvent.click(connectButton);
    expect(mockSerialService.connect).toHaveBeenCalled();
  });

  it('handles skip button click', async () => {
    jest.useFakeTimers();
    renderSplashscreen();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    const skipButton = screen.getByText('Skip Loading');
    fireEvent.click(skipButton);
    expect(mockStore.settingsStore.setIsLoaded).toHaveBeenCalledWith(true);
    jest.useRealTimers();
  });

  it('displays build information', () => {
    renderSplashscreen();
    expect(screen.getByText('Build: test-hash (2024-01-01 12:00)')).toBeInTheDocument();
  });

  it('displays unknown build information when env variables are not set', () => {
    process.env.GIT_COMMIT_HASH = undefined;
    process.env.BUILD_DATE = undefined;
    renderSplashscreen();
    expect(screen.getByText('Build: unknown (unknown)')).toBeInTheDocument();
  });
});

