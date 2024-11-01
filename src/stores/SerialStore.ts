import { makeAutoObservable } from "mobx";
import { UartStatus } from "../types/Stores";

interface SerialMessage {
  timestamp: number;
  text: string;
}

export class SerialStore {
  connectionState: UartStatus = UartStatus.Disconnected;
  error: string | null = null;
  port: SerialPort | null = null;
  messages: SerialMessage[] = [];
  lastMessageTime = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setConnectionState(state: UartStatus) {
    this.connectionState = state;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setPort(port: SerialPort | null) {
    this.port = port;
  }

  addMessage(text: string) {
    const timestamp = Date.now();
    this.messages.push({ timestamp, text });
    this.lastMessageTime = timestamp;

    // Keep only the last 100 messages
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }

  clearMessages() {
    this.messages = [];
    this.lastMessageTime = 0;
  }
}
