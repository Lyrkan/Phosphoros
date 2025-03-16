import { render } from '@testing-library/react';
import { SerialServiceProvider } from '../SerialServiceProvider';
import { useStore } from '../../stores/RootStore';
import { MessageHandlerService } from '../../services/MessageHandlerService';
import { SerialService } from '../../services/SerialService';
import { useSerialService } from '../../contexts/SerialServiceContext';
import { useCommandTrackingState } from '../../hooks/useCommandTracking';
import { ISerialService } from '../../services/interfaces/ISerialService';
import { OutgoingMessage } from '../../types/Messages';

// Mock all dependencies
jest.mock('../../stores/RootStore');
jest.mock('../../services/MessageHandlerService');
jest.mock('../../services/SerialService');
jest.mock('../../hooks/useCommandTracking');

describe('SerialServiceProvider', () => {
  // Mock setup
  const mockSetSerialService = jest.fn();
  const mockSetCommandTracking = jest.fn();
  const mockSerialStore = {};
  const mockSettingsStore = {
    setSerialService: mockSetSerialService
  };
  const mockRootStore = {
    serialStore: mockSerialStore,
    settingsStore: mockSettingsStore
  };
  const mockCommandTracking = {
    sendCommand: jest.fn(),
    handleCommandAck: jest.fn()
  };
  const mockSerialService: jest.Mocked<ISerialService> = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    sendCommand: jest.fn().mockResolvedValue({} as OutgoingMessage)
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useStore as jest.Mock).mockReturnValue(mockRootStore);
    (MessageHandlerService as jest.Mock).mockImplementation(() => ({
      setCommandTracking: mockSetCommandTracking,
      handleMessage: jest.fn()
    }));
    (SerialService as jest.Mock).mockImplementation(() => mockSerialService);
    (useCommandTrackingState as jest.Mock).mockReturnValue(mockCommandTracking);
  });

  it('should initialize services and set them in the stores', () => {
    render(
      <SerialServiceProvider>
        <div>Test Child</div>
      </SerialServiceProvider>
    );

    // Check if services were initialized correctly
    expect(MessageHandlerService).toHaveBeenCalledWith(mockRootStore);
    expect(SerialService).toHaveBeenCalledWith(
      mockSerialStore,
      expect.any(Object)
    );

    // Check if serial service was set in settings store
    expect(mockSetSerialService).toHaveBeenCalledWith(mockSerialService);
  });

  it('should set up command tracking', () => {
    render(
      <SerialServiceProvider>
        <div>Test Child</div>
      </SerialServiceProvider>
    );

    expect(mockSetCommandTracking).toHaveBeenCalledWith(mockCommandTracking);
  });

  it('should render children', () => {
    const { getByText } = render(
      <SerialServiceProvider>
        <div>Test Child Content</div>
      </SerialServiceProvider>
    );

    expect(getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should provide serial service through context', () => {
    // Create a test component that uses the serial service context
    const TestComponent = () => {
      const serialService = useSerialService();
      // Render something that proves we got the service
      return <div data-testid="test-component">{serialService === mockSerialService ? 'got-service' : 'no-service'}</div>;
    };

    const { getByTestId } = render(
      <SerialServiceProvider>
        <TestComponent />
      </SerialServiceProvider>
    );

    // Verify that our test component received the correct serial service
    expect(getByTestId('test-component')).toHaveTextContent('got-service');
  });
});

