import { UartStatus } from '../types/Stores';
import { SerialStore } from '../stores/SerialStore';
import { MessageHandlerService } from './MessageHandlerService';
import { ConnectOptions, ISerialService } from './interfaces/ISerialService';
import { OutgoingMessage, OutgoingMessageType, GrblActionPayload, SettingsPayload, CommandPayloadMap, RelaysSetPayload } from '../types/Messages';

const MAX_COMMAND_ID = 999999;
const DISCONNECT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 1000;

export const MESSAGE_RX_PREFIX = 'RX:';
export const MESSAGE_TX_PREFIX = 'TX:';
export const MESSAGE_ERROR_PREFIX = 'Error:';

export class SerialService implements ISerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private readBuffer = '';
  private nextGrblCommandId = 1;
  private cancelRead = false;
  private disconnectPromise: Promise<void> | null = null;
  private disconnectResolve: (() => void) | null = null;

  constructor(private store: SerialStore, private messageHandler: MessageHandlerService) {
  }

  async connect(options: ConnectOptions = {}) {
    const {
      maxRetries = DEFAULT_MAX_RETRIES,
      retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    } = options;

    if (this.store.connectionState === UartStatus.Connecting) {
      return;
    }

    try {
      this.store.setConnectionState(UartStatus.Connecting);
      this.store.setError(null);

      // Await any in-progress disconnect before proceeding
      if (this.disconnectPromise) {
        try { await this.disconnectPromise; } catch { /* timeout is fine */ }
      }

      // Disconnect if the port is still open from a previous session
      if (this.port?.readable) {
        await this.disconnect();
        this.store.setConnectionState(UartStatus.Connecting);
      }

      // Try to get a port, retrying if the hardware isn't enumerated yet
      let port: SerialPort | null = null;

      const ports = await navigator.serial.getPorts();
      if (ports.length > 0) {
        port = ports[0];
      } else {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            port = await navigator.serial.requestPort();
            break;
          } catch {
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
            }
          }
        }
      }

      if (!port) {
        throw new Error('No compatible serial port found');
      }

      try {
        await port.open({ baudRate: 115200 });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
          throw new Error('Failed to open serial port');
        }
        console.warn('Serial port is already open');
      }

      if (!port.readable) {
        throw new Error('Serial port is not readable');
      }

      // Set the port and cancel read flag
      this.port = port;
      this.store.setPort(port);
      this.cancelRead = false;

      // Start the reading loop in the background
      this.runReadingLoop().catch((err) => {
        console.error('Reading loop failed:', err);
        this.store.setConnectionState(UartStatus.Error);
      });

      // Set the connection state to connected
      this.store.setConnectionState(UartStatus.Connected);
      this.store.setError(null);

      // Request initial settings after successful connection
      await this.sendCommand(OutgoingMessageType.SettingsGet);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to serial port';
      this.handleError(message);
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

    this.cancelRead = true;
    this.reader?.cancel();

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
        this.readBuffer = '';
        this.store.setPort(null);
        this.store.setConnectionState(UartStatus.Disconnected);
      }

      throw error;
    } finally {
      this.disconnectPromise = null;
      this.disconnectResolve = null;
    }
  }

  isConnected(): boolean {
    return this.store.connectionState === UartStatus.Connected;
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

  private async runReadingLoop() {
    while (this.port?.readable && !this.cancelRead) {
      this.reader = this.port.readable.getReader();

      try {
        for(;;) {
          const { value, done } = await this.reader.read();
          if (done) break;

          this.readBuffer += this.decoder.decode(value, { stream: true });
          const lines = this.readBuffer.split('\n');

          // Keep the last incomplete line in the buffer
          this.readBuffer = lines.pop() || '';

          // Process complete lines
          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedMessage = JSON.parse(line);
                if (typeof parsedMessage !== 'object' || parsedMessage === null ||
                    !('t' in parsedMessage) || !('p' in parsedMessage)) {
                  this.store.addMessage(`${MESSAGE_ERROR_PREFIX} Malformed message: ${line}`);
                  continue;
                }
                this.messageHandler.handleMessage(parsedMessage);
                this.store.addMessage(`${MESSAGE_RX_PREFIX} ${line}`);
              } catch (e) {
                this.store.addMessage(`${MESSAGE_ERROR_PREFIX} Invalid JSON received: ${line}`);
              }
            }
          }
        }
        this.store.setError(null);
      } catch (error) {
        this.handleError('Error reading from serial port');
      } finally {
        this.readBuffer = '';
        this.decoder.decode();
        this.reader.releaseLock();
        this.reader = null;
      }
    }

    // Clean up when the reading loop ends
    if (this.port) {
      await this.port.close();
      this.port = null;
    }

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

  private handleError(message: string) {
    const error = new Error(message);
    console.error(message, error);

    this.store.setConnectionState(UartStatus.Error);
    this.store.setError(message);
    this.store.addMessage(`${MESSAGE_ERROR_PREFIX} ${message}`);

    throw error;
  }
}
