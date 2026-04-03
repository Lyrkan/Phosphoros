import { CommandPayloadMap, OutgoingMessage, OutgoingMessageType } from "../../types/Messages";

export interface ConnectOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface ISerialService {
  connect(options?: ConnectOptions): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  sendCommand<T extends OutgoingMessageType>(
    action: T,
    payload?: CommandPayloadMap[T]
  ): Promise<OutgoingMessage>
}
