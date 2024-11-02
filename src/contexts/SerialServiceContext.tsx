import { createContext, useContext } from 'react';
import { ISerialService } from '../services/interfaces/ISerialService';

const SerialServiceContext = createContext<ISerialService | null>(null);

export const SerialServiceContextProvider = SerialServiceContext.Provider;

export function useSerialService(): ISerialService {
  return useContext(SerialServiceContext);
}
