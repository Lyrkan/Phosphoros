import { makeAutoObservable } from 'mobx';
import { IncomingMessageType } from '../types/Messages';
import { MESSAGE_RX_PREFIX, MESSAGE_TX_PREFIX, MESSAGE_ERROR_PREFIX } from '../services/SerialService';

export enum MessageFilterId {
  StatusReport = 'rx-status',
  GrblReport = 'rx-grbl-report',
  GrblMessage = 'rx-grbl-message',
  GrblAck = 'rx-grbl-ack',
  Settings = 'rx-settings',
  Outgoing = 'tx',
  Error = 'error',
  Debug = 'debug'
}

export interface MessageFilter {
  id: MessageFilterId;
  label: string;
  isEnabled: boolean;
  predicate: (text: string) => boolean;
}

export class DebugStore {
  private _messageFilters: MessageFilter[];

  private isMessageOfType(text: string, type: IncomingMessageType): boolean {
    if (!text.startsWith(MESSAGE_RX_PREFIX)) return false;
    try {
      const jsonStr = text.substring(3).trim();
      const parsed = JSON.parse(jsonStr);
      return typeof parsed === 'object' && parsed.t === type;
    } catch {
      return false;
    }
  }

  constructor() {
    makeAutoObservable(this);

    this._messageFilters = [
      {
        id: MessageFilterId.StatusReport,
        label: 'Status Reports',
        isEnabled: false,
        predicate: (text: string) => this.isMessageOfType(text, IncomingMessageType.StatusReport),
      },
      {
        id: MessageFilterId.GrblReport,
        label: 'GRBL Reports',
        isEnabled: false,
        predicate: (text: string) => this.isMessageOfType(text, IncomingMessageType.GrblReport),
      },
      {
        id: MessageFilterId.GrblMessage,
        label: 'GRBL Messages',
        isEnabled: true,
        predicate: (text: string) => this.isMessageOfType(text, IncomingMessageType.GrblMessage),
      },
      {
        id: MessageFilterId.GrblAck,
        label: 'GRBL Acks',
        isEnabled: true,
        predicate: (text: string) => this.isMessageOfType(text, IncomingMessageType.GrblAck),
      },
      {
        id: MessageFilterId.Settings,
        label: 'Settings Updates',
        isEnabled: true,
        predicate: (text: string) => this.isMessageOfType(text, IncomingMessageType.ControllerSettings),
      },
      {
        id: MessageFilterId.Outgoing,
        label: 'Outgoing Messages',
        isEnabled: true,
        predicate: (text: string) => text.startsWith(MESSAGE_TX_PREFIX),
      },
      {
        id: MessageFilterId.Error,
        label: 'Errors',
        isEnabled: true,
        predicate: (text: string) => text.startsWith(MESSAGE_ERROR_PREFIX),
      },
      {
        id: MessageFilterId.Debug,
        label: 'Debug Messages',
        isEnabled: true,
        predicate: (text: string) => text.startsWith('[DEBUG]'),
      }
    ];
  }

  get messageFilters(): MessageFilter[] {
    return this._messageFilters;
  }

  setMessageFilterEnabled(filterId: MessageFilterId, enabled: boolean): void {
    const filter = this._messageFilters.find(f => f.id === filterId);
    if (filter) {
      filter.isEnabled = enabled;
    }
  }

  setAllMessageFiltersEnabled(enabled: boolean): void {
    this._messageFilters.forEach(filter => {
      filter.isEnabled = enabled;
    });
  }

  setMessageFilterPredicate(filterId: MessageFilterId, predicate: (text: string) => boolean): void {
    const filter = this._messageFilters.find(f => f.id === filterId);
    if (filter) {
      filter.predicate = predicate;
    }
  }
}
