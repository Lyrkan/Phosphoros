import { UartStatus } from '../types/Stores';
import { SerialStore } from '../stores/SerialStore';
import { MessageHandlerService } from './MessageHandlerService';
import { ISerialService } from './interfaces/ISerialService';
import { OutgoingMessage, OutgoingMessageType, GrblActionPayload, SettingsPayload, CommandPayloadMap, RelaysSetPayload } from '../types/Messages';

export class SerialService implements ISerialService {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private readBuffer = '';
  private nextGrblCommandId = 1;

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
          throw new Error('No compatible serial port found');
        }
      }

      await port.open({ baudRate: 115200 });

      this.store.setPort(port);
      this.store.setConnectionState(UartStatus.Connected);
      this.store.setError(null);

      this.reader = port.readable?.getReader();
      this.writer = port.writable?.getWriter()

      this.startReading();

      // Request initial settings after successful connection
      await this.sendCommand(OutgoingMessageType.SettingsGet);
    } catch (error) {
      console.error('Error connecting to serial port:', error);
      if (!ignoreError) {
        this.store.setConnectionState(UartStatus.Error);
        this.store.setError(error.message);
        this.store.addMessage(`Error: ${error.message}`);
        throw error; // Re-throw for retry mechanism
      }
    }
  }

  async disconnect() {
    try {
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

  async sendMessage(message: OutgoingMessage) {
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
  ): Promise<OutgoingMessage> {
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
}
