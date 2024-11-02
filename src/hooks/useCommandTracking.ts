import { useState, useCallback } from 'react';
import { useStore } from '../stores/RootStore';
import { GrblActionPayload, OutgoingMessageBase, OutgoingMessageType } from '../types/Messages';
import { useSerialService } from '../contexts/SerialServiceContext';

interface CommandState {
  [key: number]: {
    timeout: NodeJS.Timeout;
    isHoming?: boolean;
  };
}

export function useCommandTracking() {
  const { settingsStore, toastStore } = useStore();
  const serialService = useSerialService();
  const [pendingCommands, setPendingCommands] = useState<CommandState>({});

  const TIMEOUT_BUFFER_MS = 1000; // Add 1s to the controller timeout

  const clearCommand = useCallback((id: number) => {
    setPendingCommands(current => {
      const { [id]: removed, ...remaining } = current;
      if (removed?.timeout) {
        clearTimeout(removed.timeout);
      }
      return remaining;
    });
  }, []);

  const handleCommandTimeout = useCallback((id: number, command: string) => {
    clearCommand(id);
    toastStore.show(
      'Command Timeout',
      `Command "${command}" timed out`,
      'danger'
    );
  }, [clearCommand, toastStore]);

  const sendCommand = useCallback(async (command: string, isHoming = false): Promise<void> => {
    try {
      const response = await serialService.sendCommand(OutgoingMessageType.GrblAction, {
        message: command
      });

      // The sendCommand method in SerialService adds the ID to the message
      const commandId = (response as OutgoingMessageBase<OutgoingMessageType.GrblAction, GrblActionPayload>).p.id;
      if (commandId === undefined) {
        return;
      }

      const timeoutMs = (isHoming
        ? settingsStore.grbl.homing_timeout_ms
        : settingsStore.grbl.default_timeout_ms) ?? 10000;

      const timeout = setTimeout(
        () => handleCommandTimeout(commandId, command),
        timeoutMs + TIMEOUT_BUFFER_MS
      );

      setPendingCommands(current => ({
        ...current,
        [commandId]: { timeout, isHoming }
      }));
    } catch (error) {
      toastStore.show(
        'Command Failed',
        `Failed to send command: ${error.message}`,
        'danger'
      );
    }
  }, [serialService, settingsStore.grbl, handleCommandTimeout, toastStore]);

  const handleCommandAck = useCallback((id: number, success: boolean, error?: string) => {
    if (!success) {
      toastStore.show(
        'Command Failed',
        `Grbl command failed: ${error || 'Unknown error'}`,
        'danger'
      );
    }
    clearCommand(id);
  }, [clearCommand, toastStore]);

  const hasPendingCommands = Object.keys(pendingCommands).length > 0;

  return {
    sendCommand,
    handleCommandAck,
    hasPendingCommands
  };
}
