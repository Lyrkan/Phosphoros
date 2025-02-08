import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useCommandTrackingState } from '../useCommandTracking';
import { useStore } from '../../stores/RootStore';
import { useSerialService } from '../../contexts/SerialServiceContext';
import { OutgoingMessageType } from '../../types/Messages';

// Mock dependencies
jest.mock('../../stores/RootStore');
jest.mock('../../contexts/SerialServiceContext');

describe('useCommandTracking', () => {
  // Mock setup
  const mockSendCommand = jest.fn();
  const mockShow = jest.fn();
  const mockSettingsStore = {
    grbl: {
      default_timeout_ms: 1000,
      homing_timeout_ms: 5000
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup mocks
    (useStore as jest.Mock).mockReturnValue({
      settingsStore: mockSettingsStore,
      toastStore: { show: mockShow }
    });

    (useSerialService as jest.Mock).mockReturnValue({
      sendCommand: mockSendCommand
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should send a command successfully', async () => {
    mockSendCommand.mockResolvedValue({
      t: OutgoingMessageType.GrblAction,
      p: { id: 1, message: 'G0 X0' }
    });

    const { result } = renderHook(() => useCommandTrackingState());

    await act(async () => {
      await result.current.sendCommand('G0 X0');
    });

    expect(mockSendCommand).toHaveBeenCalledWith(
      OutgoingMessageType.GrblAction,
      { message: 'G0 X0' }
    );
    expect(result.current.hasPendingCommands).toBe(true);
  });

  it('should handle command acknowledgment', async () => {
    mockSendCommand.mockResolvedValue({
      t: OutgoingMessageType.GrblAction,
      p: { id: 1, message: 'G0 X0' }
    });

    const { result } = renderHook(() => useCommandTrackingState());

    await act(async () => {
      await result.current.sendCommand('G0 X0');
    });

    expect(result.current.hasPendingCommands).toBe(true);

    act(() => {
      result.current.handleCommandAck(1, true);
    });

    expect(result.current.hasPendingCommands).toBe(false);
  });

  it('should handle command failure acknowledgment', async () => {
    mockSendCommand.mockResolvedValue({
      t: OutgoingMessageType.GrblAction,
      p: { id: 1, message: 'G0 X0' }
    });

    const { result } = renderHook(() => useCommandTrackingState());

    await act(async () => {
      await result.current.sendCommand('G0 X0');
    });

    act(() => {
      result.current.handleCommandAck(1, false, 'Command failed');
    });

    expect(mockShow).toHaveBeenCalledWith(
      'Command Failed',
      'Grbl command failed: Command failed',
      'danger'
    );
    expect(result.current.hasPendingCommands).toBe(false);
  });

  it('should handle command timeout', async () => {
    mockSendCommand.mockResolvedValue({
      t: OutgoingMessageType.GrblAction,
      p: { id: 1, message: 'G0 X0' }
    });

    const { result } = renderHook(() => useCommandTrackingState());

    await act(async () => {
      await result.current.sendCommand('G0 X0');
    });

    act(() => {
      jest.advanceTimersByTime(mockSettingsStore.grbl.default_timeout_ms + 1000);
    });

    expect(mockShow).toHaveBeenCalledWith(
      'Command Timeout',
      'Command "G0 X0" timed out',
      'danger'
    );
    expect(result.current.hasPendingCommands).toBe(false);
  });

  it('should use different timeout for homing commands', async () => {
    mockSendCommand.mockResolvedValue({
      t: OutgoingMessageType.GrblAction,
      p: { id: 1, message: '$H' }
    });

    const { result } = renderHook(() => useCommandTrackingState());

    await act(async () => {
      await result.current.sendCommand('$H', true);
    });

    // Should not timeout at default timeout
    act(() => {
      jest.advanceTimersByTime(mockSettingsStore.grbl.default_timeout_ms + 1000);
    });
    expect(mockShow).not.toHaveBeenCalled();
    expect(result.current.hasPendingCommands).toBe(true);

    // Should timeout at homing timeout
    act(() => {
      jest.advanceTimersByTime(mockSettingsStore.grbl.homing_timeout_ms);
    });
    expect(mockShow).toHaveBeenCalledWith(
      'Command Timeout',
      'Command "$H" timed out',
      'danger'
    );
    expect(result.current.hasPendingCommands).toBe(false);
  });

  it('should handle send command failure', async () => {
    const error = new Error('Failed to send');
    mockSendCommand.mockRejectedValue(error);

    const { result } = renderHook(() => useCommandTrackingState());

    await act(async () => {
      await result.current.sendCommand('G0 X0');
    });

    expect(mockShow).toHaveBeenCalledWith(
      'Command Failed',
      'Failed to send command: Failed to send',
      'danger'
    );
    expect(result.current.hasPendingCommands).toBe(false);
  });

  it('should ignore acknowledgment for unknown command id', () => {
    const { result } = renderHook(() => useCommandTrackingState());

    act(() => {
      result.current.handleCommandAck(999, true);
    });

    expect(mockShow).not.toHaveBeenCalled();
    expect(result.current.hasPendingCommands).toBe(false);
  });
});

