import { CommandPayloadMap, OutgoingMessage, OutgoingMessageType } from "../../types/Messages";

export interface ISerialService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(message: unknown): Promise<void>;
  sendCommand<T extends OutgoingMessageType>(
    action: T,
    payload?: CommandPayloadMap[T]
  ): Promise<OutgoingMessage>
}
