import { IncomingMessage } from '../../types/Messages';

export interface IMessageHandlerService {
  handleMessage(message: IncomingMessage): void;
}
