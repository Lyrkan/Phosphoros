import { SerialStore } from '../SerialStore';
import { UartStatus } from '../../types/Stores';

describe('SerialStore', () => {
  let store: SerialStore;

  beforeEach(() => {
    store = new SerialStore();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.connectionState).toBe(UartStatus.Disconnected);
      expect(store.error).toBeNull();
      expect(store.messages).toEqual([]);
      expect(store.lastMessageTime).toBe(0);
      expect(store.port).toBeNull();
    });
  });

  describe('connection state management', () => {
    it('should update connection state', () => {
      store.setConnectionState(UartStatus.Connected);
      expect(store.connectionState).toBe(UartStatus.Connected);
    });

    it('should handle all connection states', () => {
      const states = [UartStatus.Connected, UartStatus.Disconnected, UartStatus.Unknown];
      states.forEach(state => {
        store.setConnectionState(state);
        expect(store.connectionState).toBe(state);
      });
    });
  });

  describe('error management', () => {
    it('should set error message', () => {
      store.setError('Test error');
      expect(store.error).toBe('Test error');
    });

    it('should clear error message', () => {
      store.setError('Test error');
      store.setError(null);
      expect(store.error).toBeNull();
    });
  });

  describe('port management', () => {
    it('should set port', () => {
      const mockPort = {} as SerialPort;
      store.setPort(mockPort);
      expect(store.port).toStrictEqual(mockPort);
    });

    it('should clear port', () => {
      const mockPort = {} as SerialPort;
      store.setPort(mockPort);
      store.setPort(null);
      expect(store.port).toBeNull();
    });
  });

  describe('message management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should add message', () => {
      const now = Date.now();
      store.addMessage('Test message');

      expect(store.messages).toHaveLength(1);
      expect(store.messages[0].text).toBe('Test message');
      expect(store.messages[0].timestamp).toBeGreaterThanOrEqual(now);
      expect(store.lastMessageTime).toBe(store.messages[0].timestamp);
    });

    it('should maintain message order', () => {
      const messages = ['First', 'Second', 'Third'];
      messages.forEach(msg => store.addMessage(msg));

      expect(store.messages).toHaveLength(3);
      expect(store.messages.map(m => m.text)).toEqual(messages);
    });

    it('should limit number of messages', () => {
      // Add more than MAX_MESSAGES messages
      for (let i = 0; i < 1100; i++) {
        store.addMessage(`Message ${i}`);
      }

      expect(store.messages).toHaveLength(250); // MAX_MESSAGES constant
      expect(store.messages[0].text).toBe('Message 850');
      expect(store.messages[249].text).toBe('Message 1099');
    });

    it('should clear messages', () => {
      store.addMessage('Test message');
      expect(store.messages).toHaveLength(1);
      expect(store.lastMessageTime).not.toBe(0);

      store.clearMessages();
      expect(store.messages).toHaveLength(0);
      expect(store.lastMessageTime).toBe(0);
    });

    it('should update lastMessageTime when adding messages', () => {
      const firstTime = Date.now();
      store.addMessage('First message');
      const firstMessageTime = store.lastMessageTime;

      jest.advanceTimersByTime(1000);

      store.addMessage('Second message');
      const secondMessageTime = store.lastMessageTime;

      expect(secondMessageTime).toBeGreaterThan(firstMessageTime);
      expect(firstMessageTime).toBeGreaterThanOrEqual(firstTime);
    });
  });

  describe('complex scenarios', () => {
    it('should handle connection lifecycle', () => {
      // Initial connection
      store.setConnectionState(UartStatus.Connected);
      store.setPort({} as SerialPort);
      expect(store.connectionState).toBe(UartStatus.Connected);
      expect(store.port).not.toBeNull();

      // Receive messages
      store.addMessage('Connected successfully');
      expect(store.messages).toHaveLength(1);

      // Encounter error
      store.setError('Connection lost');
      expect(store.error).toBe('Connection lost');

      // Disconnect
      store.setConnectionState(UartStatus.Disconnected);
      store.setPort(null);
      store.setError(null);
      expect(store.connectionState).toBe(UartStatus.Disconnected);
      expect(store.port).toBeNull();
      expect(store.error).toBeNull();
    });

    it('should maintain message history across connection changes', () => {
      // Add messages during connected state
      store.setConnectionState(UartStatus.Connected);
      store.addMessage('Connected message');

      // Change connection state
      store.setConnectionState(UartStatus.Disconnected);
      store.addMessage('Disconnected message');

      // Messages should persist
      expect(store.messages).toHaveLength(2);
      expect(store.messages[0].text).toBe('Connected message');
      expect(store.messages[1].text).toBe('Disconnected message');
    });
  });
});

