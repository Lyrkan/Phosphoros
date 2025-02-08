import { ToastStore } from '../ToastStore';

describe('ToastStore', () => {
  let store: ToastStore;

  beforeEach(() => {
    store = new ToastStore();
  });

  describe('initialization', () => {
    it('should initialize with empty toasts array', () => {
      expect(store.toasts).toEqual([]);
    });
  });

  describe('showing toasts', () => {
    it('should add toast with default values', () => {
      store.show('Test Title', 'Test Message');

      expect(store.toasts).toHaveLength(1);
      expect(store.toasts[0]).toEqual({
        id: 1,
        title: 'Test Title',
        message: 'Test Message',
        variant: 'info',
        autohide: true,
        delay: 3000
      });
    });

    it('should add toast with custom values', () => {
      store.show('Test Title', 'Test Message', 'danger', false, 5000);

      expect(store.toasts).toHaveLength(1);
      expect(store.toasts[0]).toEqual({
        id: 1,
        title: 'Test Title',
        message: 'Test Message',
        variant: 'danger',
        autohide: false,
        delay: 5000
      });
    });

    it('should increment toast IDs', () => {
      store.show('First Toast', 'Message 1');
      store.show('Second Toast', 'Message 2');
      store.show('Third Toast', 'Message 3');

      expect(store.toasts).toHaveLength(3);
      expect(store.toasts.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('should maintain toast order', () => {
      const toasts = [
        { title: 'First', message: 'Message 1' },
        { title: 'Second', message: 'Message 2' },
        { title: 'Third', message: 'Message 3' }
      ];

      toasts.forEach(t => store.show(t.title, t.message));

      expect(store.toasts.map(t => t.title)).toEqual(['First', 'Second', 'Third']);
    });
  });

  describe('removing toasts', () => {
    beforeEach(() => {
      // Add some test toasts
      store.show('Toast 1', 'Message 1');
      store.show('Toast 2', 'Message 2');
      store.show('Toast 3', 'Message 3');
    });

    it('should remove toast by ID', () => {
      store.remove(2);

      expect(store.toasts).toHaveLength(2);
      expect(store.toasts.map(t => t.id)).toEqual([1, 3]);
    });

    it('should not affect other toasts when removing one', () => {
      store.remove(2);

      expect(store.toasts[0]).toEqual({
        id: 1,
        title: 'Toast 1',
        message: 'Message 1',
        variant: 'info',
        autohide: true,
        delay: 3000
      });
      expect(store.toasts[1]).toEqual({
        id: 3,
        title: 'Toast 3',
        message: 'Message 3',
        variant: 'info',
        autohide: true,
        delay: 3000
      });
    });

    it('should handle removing non-existent toast', () => {
      store.remove(999);
      expect(store.toasts).toHaveLength(3);
    });

    it('should handle removing all toasts', () => {
      store.toasts.forEach(toast => store.remove(toast.id));
      expect(store.toasts).toHaveLength(0);
    });
  });

  describe('toast variants', () => {
    it('should handle info variant', () => {
      store.show('Info Toast', 'Message', 'info');
      expect(store.toasts[0].variant).toBe('info');
    });

    it('should handle success variant', () => {
      store.show('Success Toast', 'Message', 'success');
      expect(store.toasts[0].variant).toBe('success');
    });

    it('should handle warning variant', () => {
      store.show('Warning Toast', 'Message', 'warning');
      expect(store.toasts[0].variant).toBe('warning');
    });

    it('should handle danger variant', () => {
      store.show('Error Toast', 'Message', 'danger');
      expect(store.toasts[0].variant).toBe('danger');
    });
  });

  describe('autohide and delay', () => {
    it('should set autohide to false', () => {
      store.show('Test Toast', 'Message', 'info', false);
      expect(store.toasts[0].autohide).toBe(false);
    });

    it('should set custom delay', () => {
      store.show('Test Toast', 'Message', 'info', true, 5000);
      expect(store.toasts[0].delay).toBe(5000);
    });

    it('should use default delay when not specified', () => {
      store.show('Test Toast', 'Message');
      expect(store.toasts[0].delay).toBe(3000);
    });
  });
});

