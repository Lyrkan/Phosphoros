import { DebugStore, MessageFilterId } from '../DebugStore';
import { IncomingMessageType } from '../../types/Messages';
import { MESSAGE_RX_PREFIX, MESSAGE_TX_PREFIX, MESSAGE_ERROR_PREFIX } from '../../services/SerialService';

describe('DebugStore', () => {
  let store: DebugStore;

  beforeEach(() => {
    store = new DebugStore();
  });

  describe('initialization', () => {
    it('should initialize with default message filters', () => {
      expect(store.messageFilters).toHaveLength(7);
      expect(store.messageFilters.map(f => f.id)).toEqual([
        MessageFilterId.StatusReport,
        MessageFilterId.GrblReport,
        MessageFilterId.GrblMessage,
        MessageFilterId.GrblAck,
        MessageFilterId.Settings,
        MessageFilterId.Outgoing,
        MessageFilterId.Error
      ]);
    });

    it('should initialize with correct default enabled states', () => {
      const enabledFilters = store.messageFilters.filter(f => f.isEnabled);
      expect(enabledFilters.map(f => f.id)).toEqual([
        MessageFilterId.GrblMessage,
        MessageFilterId.GrblAck,
        MessageFilterId.Settings,
        MessageFilterId.Outgoing,
        MessageFilterId.Error
      ]);
    });
  });

  describe('filter management', () => {
    it('should enable a filter', () => {
      store.setMessageFilterEnabled(MessageFilterId.StatusReport, true);
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.StatusReport);
      expect(filter?.isEnabled).toBe(true);
    });

    it('should disable a filter', () => {
      store.setMessageFilterEnabled(MessageFilterId.GrblMessage, false);
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.GrblMessage);
      expect(filter?.isEnabled).toBe(false);
    });

    it('should enable all filters', () => {
      store.setAllMessageFiltersEnabled(true);
      expect(store.messageFilters.every(f => f.isEnabled)).toBe(true);
    });

    it('should disable all filters', () => {
      store.setAllMessageFiltersEnabled(false);
      expect(store.messageFilters.every(f => !f.isEnabled)).toBe(true);
    });

    it('should handle setting predicate for a filter', () => {
      const newPredicate = (text: string) => text.includes('test');
      store.setMessageFilterPredicate(MessageFilterId.GrblMessage, newPredicate);

      const filter = store.messageFilters.find(f => f.id === MessageFilterId.GrblMessage);
      expect(filter?.predicate('test message')).toBe(true);
      expect(filter?.predicate('other message')).toBe(false);
    });
  });

  describe('message filtering', () => {
    it('should correctly filter status report messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.StatusReport);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.StatusReport}}`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.GrblReport}}`)).toBe(false);
    });

    it('should correctly filter GRBL report messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.GrblReport);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.GrblReport}}`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.StatusReport}}`)).toBe(false);
    });

    it('should correctly filter GRBL message messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.GrblMessage);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.GrblMessage}}`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.StatusReport}}`)).toBe(false);
    });

    it('should correctly filter GRBL ack messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.GrblAck);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.GrblAck}}`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.StatusReport}}`)).toBe(false);
    });

    it('should correctly filter settings messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.Settings);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.ControllerSettings}}`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}{"t":${IncomingMessageType.StatusReport}}`)).toBe(false);
    });

    it('should correctly filter outgoing messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.Outgoing);
      expect(filter?.predicate(`${MESSAGE_TX_PREFIX}some command`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}some response`)).toBe(false);
    });

    it('should correctly filter error messages', () => {
      const filter = store.messageFilters.find(f => f.id === MessageFilterId.Error);
      expect(filter?.predicate(`${MESSAGE_ERROR_PREFIX}some error`)).toBe(true);
      expect(filter?.predicate(`${MESSAGE_RX_PREFIX}some message`)).toBe(false);
    });
  });
});
