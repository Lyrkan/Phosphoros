import { makeAutoObservable } from 'mobx';

export enum MessageFilterId {
  StatusReport = 'rx-status',
  GrblReport = 'rx-grbl-report',
  GrblMessage = 'rx-grbl-message',
  GrblAck = 'rx-grbl-ack',
  Settings = 'rx-settings',
  Outgoing = 'tx',
  Error = 'error',
}

export interface MessageFilter {
  id: MessageFilterId;
  label: string;
  isEnabled: boolean;
  predicate: (text: string) => boolean;
}

export class DebugStore {
  private _messageFilters: MessageFilter[];

  constructor() {
    makeAutoObservable(this);

    this._messageFilters = [
      {
        id: MessageFilterId.StatusReport,
        label: 'Status Reports',
        isEnabled: true,
        predicate: () => false, // Will be set in Debug.tsx
      },
      {
        id: MessageFilterId.GrblReport,
        label: 'GRBL Reports',
        isEnabled: true,
        predicate: () => false,
      },
      {
        id: MessageFilterId.GrblMessage,
        label: 'GRBL Messages',
        isEnabled: true,
        predicate: () => false,
      },
      {
        id: MessageFilterId.GrblAck,
        label: 'GRBL Acks',
        isEnabled: true,
        predicate: () => false,
      },
      {
        id: MessageFilterId.Settings,
        label: 'Settings Updates',
        isEnabled: true,
        predicate: () => false,
      },
      {
        id: MessageFilterId.Outgoing,
        label: 'Outgoing Messages',
        isEnabled: true,
        predicate: () => false,
      },
      {
        id: MessageFilterId.Error,
        label: 'Errors',
        isEnabled: true,
        predicate: () => false,
      },
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
