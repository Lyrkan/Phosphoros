import { ReactNode, useEffect, useMemo } from 'react';
import { useStore } from '../stores/RootStore';
import { MessageHandlerService } from '../services/MessageHandlerService';
import { SerialService } from '../services/SerialService';
import { SerialServiceContextProvider } from '../contexts/SerialServiceContext';
import { useCommandTrackingState } from '../hooks/useCommandTracking';
import { CommandTrackingProvider } from '../contexts/CommandTrackingContext';

function SerialServiceComponent({
  messageHandler,
  serialService,
  children
}: {
  messageHandler: MessageHandlerService;
  serialService: SerialService;
  children: ReactNode;
}) {
  return (
    <SerialServiceContextProvider value={serialService}>
      <CommandTrackingInitializer messageHandler={messageHandler}>
        {children}
      </CommandTrackingInitializer>
    </SerialServiceContextProvider>
  );
}

function CommandTrackingInitializer({
  messageHandler,
  children
}: {
  messageHandler: MessageHandlerService;
  children: ReactNode;
}) {
  const commandTracking = useCommandTrackingState();

  useEffect(() => {
    messageHandler.setCommandTracking(commandTracking);
  }, [messageHandler, commandTracking]);

  return (
    <CommandTrackingProvider value={commandTracking}>
      {children}
    </CommandTrackingProvider>
  );
}

export function SerialServiceProvider({ children }: { children: ReactNode }) {
  const rootStore = useStore();
  const messageHandler = useMemo(() => new MessageHandlerService(rootStore), [rootStore]);
  const serialService = useMemo(
    () => new SerialService(rootStore.serialStore, messageHandler),
    [rootStore.serialStore, messageHandler]
  );

  useEffect(() => {
    rootStore.settingsStore.setSerialService(serialService);
  }, [rootStore.settingsStore, serialService]);

  return (
    <SerialServiceComponent
      messageHandler={messageHandler}
      serialService={serialService}
    >
      {children}
    </SerialServiceComponent>
  );
}
