import { useCallback, useRef, useState } from 'react';
import { useStore } from '../stores/RootStore';
import { GrblActionPayload, OutgoingMessageBase, OutgoingMessageType } from '../types/Messages';
import { useSerialService } from '../contexts/SerialServiceContext';

const TIMEOUT_BUFFER_MS = 1000; // Add 1s to the controller timeout

interface CommandState {
  [key: number]: {
    timeout: NodeJS.Timeout;
    isHoming?: boolean;
  };
}

export function useCommandTrackingState() {
  const { settingsStore, toastStore } = useStore();
  const serialService = useSerialService();
  const pendingCommandsRef = useRef<CommandState>({} as CommandState);
  const [hasPendingCommands, setHasPendingCommands] = useState(false);

  const updateHasPendingCommands = useCallback(() => {
    const count = Object.keys(pendingCommandsRef.current).length;
    setHasPendingCommands(count > 0);
  }, []);

  const clearCommand = useCallback((id: number) => {
    const command = pendingCommandsRef.current[id];
    if (command?.timeout) {
      clearTimeout(command.timeout);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...remaining } = pendingCommandsRef.current;
    pendingCommandsRef.current = remaining;
    updateHasPendingCommands();
  }, [updateHasPendingCommands]);

  const handleCommandTimeout = useCallback((id: number, command: string) => {
    // Check if command was already cleared (acknowledged)
    if (!pendingCommandsRef.current[id]) {
      return;
    }

    clearCommand(id);
    toastStore.show(
      'Command Timeout',
      `Command "${command}" timed out`,
      'danger'
    );
  }, [clearCommand, toastStore]);

  const sendCommand = useCallback(async (command: string, isHoming = false): Promise<void> => {
    try {
      const sentCommand = await serialService.sendCommand(OutgoingMessageType.GrblAction, {
        message: command
      });

      // The sendCommand method in SerialService adds the ID to the message
      const commandId = (sentCommand as OutgoingMessageBase<OutgoingMessageType.GrblAction, GrblActionPayload>).p.id;
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

      pendingCommandsRef.current = {
        ...pendingCommandsRef.current,
        [commandId]: { timeout, isHoming }
      };
      updateHasPendingCommands();
    } catch (error) {
      toastStore.show(
        'Command Failed',
        `Failed to send command: ${error.message}`,
        'danger'
      );
    }
  }, [serialService, settingsStore.grbl, handleCommandTimeout, toastStore, updateHasPendingCommands]);

  const handleCommandAck = useCallback((id: number, success: boolean, error?: string) => {
    if (!pendingCommandsRef.current[id]) {
      return;
    }

    if (!success) {
      toastStore.show(
        'Command Failed',
        `Grbl command failed: ${error || 'Unknown error'}`,
        'danger'
      );
    }
    clearCommand(id);
  }, [clearCommand, toastStore]);

  return {
    sendCommand,
    handleCommandAck,
    hasPendingCommands
  };
}
