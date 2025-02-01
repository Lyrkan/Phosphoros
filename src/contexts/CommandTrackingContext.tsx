import { createContext, useContext } from 'react';

interface CommandTracking {
  sendCommand: (command: string, isHoming?: boolean) => Promise<void>;
  handleCommandAck: (id: number, success: boolean, error?: string) => void;
  hasPendingCommands: boolean;
}

const CommandTrackingContext = createContext<CommandTracking | null>(null);

export function useCommandTracking(): CommandTracking {
  const context = useContext(CommandTrackingContext);
  if (!context) {
    throw new Error('useCommandTracking must be used within a CommandTrackingProvider');
  }
  return context;
}

export const CommandTrackingProvider = CommandTrackingContext.Provider;
