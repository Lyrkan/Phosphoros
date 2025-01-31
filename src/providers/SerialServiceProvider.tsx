import { ReactNode, useEffect } from 'react';
import { useStore } from '../stores/RootStore';
import { MessageHandlerService } from '../services/MessageHandlerService';
import { SerialService } from '../services/SerialService';
import { SerialServiceContextProvider } from '../contexts/SerialServiceContext';
import { useCommandTracking } from '../hooks/useCommandTracking';

function SerialServiceComponent({
  messageHandler,
  serialService,
  children
}: {
  messageHandler: MessageHandlerService;
  serialService: SerialService;
  children: ReactNode;
}) {
  const commandTracking = useCommandTracking();

  useEffect(() => {
    messageHandler.setCommandTracking(commandTracking);
  }, [messageHandler, commandTracking]);

  return (
    <SerialServiceContextProvider value={serialService}>
      {children}
    </SerialServiceContextProvider>
  );
}

export function SerialServiceProvider({ children }: { children: ReactNode }) {
  const rootStore = useStore();
  const messageHandler = new MessageHandlerService(rootStore);
  const serialService = new SerialService(rootStore.serialStore, messageHandler);

  // Set the serial service in the settings store
  rootStore.settingsStore.setSerialService(serialService);

  return (
    <SerialServiceComponent
      messageHandler={messageHandler}
      serialService={serialService}
    >
      {children}
    </SerialServiceComponent>
  );
}
