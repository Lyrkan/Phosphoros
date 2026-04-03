import { makeAutoObservable } from "mobx";
import { UartStatus } from "../types/Stores";

interface SerialMessage {
  timestamp: number;
  text: string;
}

const MAX_MESSAGES = 250;

export class SerialStore {
  private _connectionState: UartStatus = UartStatus.Disconnected;
  private _error: string | null = null;
  private _messages: SerialMessage[] = [];
  private _lastMessageTime = 0;

  port: SerialPort | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get connectionState() {
    return this._connectionState;
  }

  get error() {
    return this._error;
  }

  get messages(): ReadonlyArray<SerialMessage> {
    return this._messages;
  }

  get lastMessageTime() {
    return this._lastMessageTime;
  }

  setConnectionState = (state: UartStatus) => {
    this._connectionState = state;
  };

  setError = (error: string | null) => {
    this._error = error;
  };

  setPort = (port: SerialPort | null) => {
    this.port = port;
  };

  addMessage = (text: string) => {
    const timestamp = Date.now();
    this._messages.push({ timestamp, text });
    this._lastMessageTime = timestamp;

    // Keep only the last MAX_MESSAGES messages
    if (this._messages.length > MAX_MESSAGES) {
      this._messages.shift();
    }
  };

  clearMessages = () => {
    this._messages = [];
    this._lastMessageTime = 0;
  };
}
