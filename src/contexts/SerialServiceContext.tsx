import { createContext, useContext } from 'react';
import { ISerialService } from '../services/interfaces/ISerialService';

const SerialServiceContext = createContext<ISerialService | null>(null);

export const SerialServiceProvider = SerialServiceContext.Provider;

export function useSerialService(): ISerialService {
  const service = useContext(SerialServiceContext);
  if (!service) {
    throw new Error('useSerialService must be used within a SerialServiceProvider');
  }
  return service;
}
