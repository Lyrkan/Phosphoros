import { useCallback, useRef, useState } from 'react';
import { useStore } from '../stores/RootStore';
import { GrblActionPayload, OutgoingMessageBase, OutgoingMessageType } from '../types/Messages';
import { useSerialService } from '../contexts/SerialServiceContext';

interface CommandState {
  [key: number]: {
    timeout: NodeJS.Timeout;
    isHoming?: boolean;
  };
}

export function useCommandTrackingState() {
  const { settingsStore, toastStore, serialStore } = useStore();
  const serialService = useSerialService();
  const pendingCommandsRef = useRef<CommandState>({} as CommandState);
  const [hasPendingCommands, setHasPendingCommands] = useState(false);

  const TIMEOUT_BUFFER_MS = 1000; // Add 1s to the controller timeout

  const updateHasPendingCommands = useCallback(() => {
    const count = Object.keys(pendingCommandsRef.current).length;
    setHasPendingCommands(count > 0);
    serialStore.addMessage(`[DEBUG] Pending commands count: ${count}`);
    serialStore.addMessage(`[DEBUG] Pending commands state: ${JSON.stringify(Object.keys(pendingCommandsRef.current))}`);
  }, [serialStore]);

  const clearCommand = useCallback((id: number) => {
    serialStore.addMessage(`[DEBUG] Attempting to clear command #${id}`);
    serialStore.addMessage(`[DEBUG] Current pending commands before clear: ${JSON.stringify(Object.keys(pendingCommandsRef.current))}`);
    const command = pendingCommandsRef.current[id];
    if (command?.timeout) {
      clearTimeout(command.timeout);
      serialStore.addMessage(`[DEBUG] Cleared timeout for command #${id}`);
    } else {
      serialStore.addMessage(`[DEBUG] No timeout found for command #${id}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...remaining } = pendingCommandsRef.current;
    pendingCommandsRef.current = remaining;
    updateHasPendingCommands();
  }, [updateHasPendingCommands, serialStore]);

  const handleCommandTimeout = useCallback((id: number, command: string) => {
    // Check if command was already cleared (acknowledged)
    if (!pendingCommandsRef.current[id]) {
      serialStore.addMessage(`[DEBUG] Timeout triggered for command #${id} but it was already cleared`);
      return;
    }

    serialStore.addMessage(`[DEBUG] Command #${id} timed out: "${command}"`);
    clearCommand(id);
    toastStore.show(
      'Command Timeout',
      `Command "${command}" timed out`,
      'danger'
    );
  }, [clearCommand, toastStore, serialStore]);

  const sendCommand = useCallback(async (command: string, isHoming = false): Promise<void> => {
    try {
      const sentCommand = await serialService.sendCommand(OutgoingMessageType.GrblAction, {
        message: command
      });

      // The sendCommand method in SerialService adds the ID to the message
      const commandId = (sentCommand as OutgoingMessageBase<OutgoingMessageType.GrblAction, GrblActionPayload>).p.id;
      if (commandId === undefined) {
        serialStore.addMessage('[DEBUG] Command sent without ID');
        return;
      }

      const timeoutMs = (isHoming
        ? settingsStore.grbl.homing_timeout_ms
        : settingsStore.grbl.default_timeout_ms) ?? 10000;

      serialStore.addMessage(`[DEBUG] Setting timeout of ${timeoutMs + TIMEOUT_BUFFER_MS}ms for command #${commandId}`);

      const timeout = setTimeout(
        () => handleCommandTimeout(commandId, command),
        timeoutMs + TIMEOUT_BUFFER_MS
      );

      pendingCommandsRef.current = {
        ...pendingCommandsRef.current,
        [commandId]: { timeout, isHoming }
      };
      updateHasPendingCommands();

      serialStore.addMessage(`[DEBUG] Command #${commandId} registered: "${command}"`);
    } catch (error) {
      serialStore.addMessage(`[DEBUG] Failed to send command: ${error.message}`);
      toastStore.show(
        'Command Failed',
        `Failed to send command: ${error.message}`,
        'danger'
      );
    }
  }, [serialService, settingsStore.grbl, handleCommandTimeout, toastStore, updateHasPendingCommands, serialStore]);

  const handleCommandAck = useCallback((id: number, success: boolean, error?: string) => {
    serialStore.addMessage(`[DEBUG] Received ack for command #${id} (success: ${success}${error ? `, error: ${error}` : ''})`);
    serialStore.addMessage(`[DEBUG] Current pending commands at ack: ${JSON.stringify(Object.keys(pendingCommandsRef.current))}`);

    if (!pendingCommandsRef.current[id]) {
      serialStore.addMessage(`[DEBUG] Received ack for unknown command #${id}`);
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
  }, [clearCommand, toastStore, serialStore]);

  return {
    sendCommand,
    handleCommandAck,
    hasPendingCommands
  };
}
