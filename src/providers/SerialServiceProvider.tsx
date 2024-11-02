import { ReactNode } from 'react';
import { useStore } from '../stores/RootStore';
import { MessageHandlerService } from '../services/MessageHandlerService';
import { SerialService } from '../services/SerialService';
import { SerialServiceContextProvider } from '../contexts/SerialServiceContext';
import { useCommandTracking } from '../hooks/useCommandTracking';

export function SerialServiceProvider({ children }: { children: ReactNode }) {
  const rootStore = useStore();

  const messageHandler = new MessageHandlerService(rootStore);
  const serialService = new SerialService(rootStore.serialStore, messageHandler);

  const commandTracking = useCommandTracking();
  messageHandler.setCommandTracking(commandTracking);

  // Set the serial service in the settings store
  rootStore.settingsStore.setSerialService(serialService);

  return (
    <SerialServiceContextProvider value={serialService}>
      {children}
    </SerialServiceContextProvider>
  );
}
