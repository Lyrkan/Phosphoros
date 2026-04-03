import { createContext, useContext } from 'react';
import { ISerialService } from '../services/interfaces/ISerialService';

const SerialServiceContext = createContext<ISerialService | null>(null);

export const SerialServiceContextProvider = SerialServiceContext.Provider;

export function useSerialService(): ISerialService {
  const context = useContext(SerialServiceContext);
  if (!context) {
    throw new Error('useSerialService must be used within a SerialServiceProvider');
  }
  return context;
}
