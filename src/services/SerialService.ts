import { UartStatus } from '../types/Stores';
import { SerialStore } from '../stores/SerialStore';
import { MessageHandlerService } from './MessageHandlerService';
import { ISerialService } from './interfaces/ISerialService';
import { OutgoingMessage, OutgoingMessageType, GrblActionPayload, SettingsPayload, CommandPayloadMap } from '../types/Messages';

export class SerialService implements ISerialService {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private readBuffer = '';
  private retryTimeout: NodeJS.Timeout | null = null;
  private readonly RETRY_INTERVAL = 10000; // 10 seconds
  private nextGrblCommandId = 1;

  constructor(private store: SerialStore, private messageHandler: MessageHandlerService) {
    // Start connection attempt immediately
    this.connectWithRetry();
  }

  private async connectWithRetry() {
    try {
      await this.connect();
    } catch (error) {
      console.warn('Failed to connect:', error);
      // Schedule retry
      this.scheduleRetry();
    }
  }

  private scheduleRetry() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      this.connectWithRetry();
    }, this.RETRY_INTERVAL);
  }

  async connect() {
    try {
      // Try to get any previously authorized ports
      const ports = await navigator.serial.getPorts() || [];
      let port: SerialPort;

      if (ports.length > 0) {
        // Use the first available previously authorized port
        port = ports[0];
      } else {
        // If no previously authorized ports, try with filters
        const filters = [
          // Common USB-to-Serial converter vendors
          { usbVendorId: 0x1a86 }, // QinHeng Electronics
          { usbVendorId: 0x0403 }, // FTDI
          { usbVendorId: 0x10c4 }, // Silicon Labs
          { usbVendorId: 0x067b }, // Prolific Technology
        ];

        try {
          port = await navigator.serial.requestPort({ filters });
        } catch (e) {
          throw new Error('No compatible serial port found');
        }
      }
      await port.open({ baudRate: 115200 });

      this.store.setPort(port);
      this.store.setConnectionState(UartStatus.Connected);
      this.store.setError(null);

      this.reader = port.readable?.getReader();
      this.writer = port.writable?.getWriter();

      // Clear any existing retry timeout
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }

      this.startReading();
    } catch (error) {
      this.store.setConnectionState(UartStatus.Error);
      this.store.setError(error.message);
      this.store.addMessage(`Error: ${error.message}`);
      throw error; // Re-throw for retry mechanism
    }
  }

  async disconnect() {
    try {
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }

      await this.reader?.cancel();
      await this.writer?.close();
      await this.store.port?.close();

      this.reader = null;
      this.writer = null;
      this.store.setPort(null);
      this.store.setConnectionState(UartStatus.Disconnected);
      this.store.setError(null);
    } catch (error) {
      this.store.setConnectionState(UartStatus.Error);
      this.store.setError(error.message);
      this.store.addMessage(`Error: ${error.message}`);
    }
  }

  async sendMessage(message: unknown) {
    if (!this.writer) {
      throw new Error('Not connected to serial port');
    }

    try {
      const jsonString = JSON.stringify(message) + '\n';
      const data = this.encoder.encode(jsonString);
      await this.writer.write(data);
      this.store.addMessage(`TX: ${jsonString.trim()}`);
    } catch (error) {
      this.store.setConnectionState(UartStatus.Error);
      this.store.setError(error.message);
    }
  }

  private async startReading() {
    while (this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }

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
              this.store.addMessage(`RX: ${line}`);
            } catch (e) {
              console.warn('Invalid JSON received:', line);
            }
          }
        }
      } catch (error) {
        this.store.setConnectionState(UartStatus.Error);
        this.store.setError(error.message);
        break;
      }
    }
  }

  async sendCommand<T extends OutgoingMessageType>(
    action: T,
    payload?: CommandPayloadMap[T]
  ): Promise<void> {
    let message: OutgoingMessage;

    switch (action) {
      case OutgoingMessageType.GrblAction:
        message = {
          a: action,
          p: {
            message: (payload as GrblActionPayload).message,
            id: this.nextGrblCommandId++
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

      default:
        throw new Error(`Unknown action type: ${action}`);
    }

    await this.sendMessage(message);
  }
}
