import { UartStatus } from '../types/Stores';
import { SerialStore } from '../stores/SerialStore';
import { MessageHandlerService } from './MessageHandlerService';
import { ISerialService } from './interfaces/ISerialService';
import { OutgoingMessage, OutgoingMessageType, GrblActionPayload, SettingsPayload, CommandPayloadMap, RelaysSetPayload } from '../types/Messages';

const MAX_COMMAND_ID = 999999;
const DISCONNECT_TIMEOUT_MS = 5000;

export const MESSAGE_RX_PREFIX = 'RX:';
export const MESSAGE_TX_PREFIX = 'TX:';
export const MESSAGE_ERROR_PREFIX = 'Error:';

export class SerialService implements ISerialService {
  private port: SerialPort | null = null;
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private readBuffer = '';
  private nextGrblCommandId = 1;
  private cancelRead = false;
  private disconnectPromise: Promise<void> | null = null;
  private disconnectResolve: (() => void) | null = null;
  constructor(private store: SerialStore, private messageHandler: MessageHandlerService) {
    // Try to connect on startup
    // This will only work if there is an already known port
    this.connect(true);
  }

  async connect(ignoreError = false) {
    try {
      // Disconnect if already connected
      if (this.store.connectionState === UartStatus.Connected) {
        await this.disconnect();
      }

      // Try to get the first available port
      const ports = await navigator.serial.getPorts();
      let port: SerialPort;
      if (ports.length > 0) {
        port = ports[0];
      } else {
        try {
          port = await navigator.serial.requestPort();
        } catch (e) {
          this.handleError('No compatible serial port found', ignoreError);
          return;
        }
      }

      try {
        await port.open({ baudRate: 115200 });
      } catch (e) {
        // Check if the error is because the port is already open
        if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
          this.handleError('Failed to open serial port', ignoreError);
          return;
        }
        console.warn('Serial port is already open');
      }

      this.port = port;
      this.store.setPort(port);
      this.store.setConnectionState(UartStatus.Connected);
      this.store.setError(null);

      this.startReading();

      // Request initial settings after successful connection
      await this.sendCommand(OutgoingMessageType.SettingsGet);
    } catch (error) {
      this.handleError('Failed to connect to serial port', ignoreError);
    }
  }

  async disconnect() {
    if (!this.port?.readable) {
      return;
    }

    // Create a new promise that will resolve when the port is fully closed
    if (!this.disconnectPromise) {
      this.disconnectPromise = Promise.race([
        new Promise<void>((resolve) => {
          this.disconnectResolve = resolve;
        }),
        new Promise<void>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Disconnect timeout'));
          }, DISCONNECT_TIMEOUT_MS);
        })
      ]);
    }

    const reader = this.port.readable.getReader();
    this.cancelRead = true;
    reader.cancel();

    try {
      // Wait for the port to be fully closed
      await this.disconnectPromise;
    } catch (error) {
      // If we timeout, force close the port
      if (this.port) {
        try {
          await this.port.close();
        } catch (e) {
          console.warn('Failed to force close port:', e);
        }

        this.port = null;
        this.store.setPort(null);
        this.store.setConnectionState(UartStatus.Disconnected);
      }

      throw error;
    } finally {
      this.disconnectPromise = null;
      this.disconnectResolve = null;
    }
  }

  async sendMessage(message: OutgoingMessage) {
    if (!this.port?.writable) {
      this.handleError('Serial port is not writable');
      return;
    }

    try {
      const writer = this.port.writable.getWriter();
      const jsonString = JSON.stringify(message) + '\n';
      const data = this.encoder.encode(jsonString);

      try {
        await writer.write(data);
        this.store.addMessage(`${MESSAGE_TX_PREFIX} ${jsonString.trim()}`);
      } catch (error) {
        this.handleError('Failed to write to serial port');
      } finally {
        writer.releaseLock();
      }
    } catch (error) {
      this.handleError('Failed to send message');
    }
  }

  private getNextCommandId(): number {
    const nextId = this.nextGrblCommandId;
    this.nextGrblCommandId = (this.nextGrblCommandId % MAX_COMMAND_ID) + 1;
    return nextId;
  }

  private async startReading() {
    if (!this.port?.readable) {
      this.handleError('Serial port is not readable');
      return;
    }

    this.cancelRead = false;
    while (this.port.readable && !this.cancelRead) {
      const reader = this.port.readable.getReader();

      try {
        for(;;) {
          const { value, done } = await reader.read();
          if (done) break;

          this.readBuffer += this.decoder.decode(value);
          const lines = this.readBuffer.split('\n');

          // Keep the last incomplete line in the buffer
          this.readBuffer = lines.pop() || '';

          // Process complete lines
          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedMessage = JSON.parse(line);
                this.messageHandler.handleMessage(parsedMessage);
                this.store.addMessage(`${MESSAGE_RX_PREFIX} ${line}`);
              } catch (e) {
                console.warn('Invalid JSON received:', line);
              }
            }
          }
        }
        this.store.setError(null);
      } catch (error) {
        this.handleError('Error reading from serial port');
      } finally {
        this.readBuffer = '';
        reader.releaseLock();
      }
    }

    await this.port.close();

    this.port = null;
    this.store.setPort(null);
    this.store.setConnectionState(UartStatus.Disconnected);

    // Resolve the disconnect promise if it exists
    if (this.disconnectResolve) {
      this.disconnectResolve();
    }
  }

  async sendCommand<T extends OutgoingMessageType>(
    action: T,
    payload?: CommandPayloadMap[T]
  ): Promise<OutgoingMessage> {
    let message: OutgoingMessage;

    switch (action) {
      case OutgoingMessageType.GrblAction:
        message = {
          a: action,
          p: {
            message: (payload as GrblActionPayload).message,
            id: this.getNextCommandId()
          }
        };
        break;

      case OutgoingMessageType.SettingsSet:
        message = {
          a: action,
          p: payload as SettingsPayload
        };
        break;

      case OutgoingMessageType.SettingsGet:
      case OutgoingMessageType.StatusGet:
        message = {
          a: action,
          p: {}
        };
        break;

      case OutgoingMessageType.RelaysSet:
        message = {
          a: action,
          p: payload as RelaysSetPayload
        };
        break;

      default:
        throw new Error(`Unknown action type: ${action}`);
    }

    await this.sendMessage(message);
    return message;
  }

  private handleError(message: string, ignoreError = false) {
    const error = new Error(message);
    console.error(message, error);

    this.store.setConnectionState(UartStatus.Error);
    this.store.setError(message);
    this.store.addMessage(`${MESSAGE_ERROR_PREFIX} ${message}`);

    if (!ignoreError) {
      throw error;
    }
  }
}
