import { LidsStore } from '../LidsStore';
import { LidState } from '../../types/Stores';

describe('LidsStore', () => {
  let store: LidsStore;

  beforeEach(() => {
    store = new LidsStore();
  });

  describe('initialization', () => {
    it('should initialize with unknown states', () => {
      expect(store.frontLidState).toBe(LidState.Unknown);
      expect(store.backLidState).toBe(LidState.Unknown);
    });
  });

  describe('front lid state management', () => {
    it('should update front lid state to opened', () => {
      store.setFrontLidState(LidState.Opened);
      expect(store.frontLidState).toBe(LidState.Opened);
    });

    it('should update front lid state to closed', () => {
      store.setFrontLidState(LidState.Closed);
      expect(store.frontLidState).toBe(LidState.Closed);
    });

    it('should update front lid state to unknown', () => {
      store.setFrontLidState(LidState.Unknown);
      expect(store.frontLidState).toBe(LidState.Unknown);
    });
  });

  describe('back lid state management', () => {
    it('should update back lid state to opened', () => {
      store.setBackLidState(LidState.Opened);
      expect(store.backLidState).toBe(LidState.Opened);
    });

    it('should update back lid state to closed', () => {
      store.setBackLidState(LidState.Closed);
      expect(store.backLidState).toBe(LidState.Closed);
    });

    it('should update back lid state to unknown', () => {
      store.setBackLidState(LidState.Unknown);
      expect(store.backLidState).toBe(LidState.Unknown);
    });
  });

  describe('state transitions', () => {
    it('should handle multiple state transitions for front lid', () => {
      store.setFrontLidState(LidState.Closed);
      expect(store.frontLidState).toBe(LidState.Closed);

      store.setFrontLidState(LidState.Opened);
      expect(store.frontLidState).toBe(LidState.Opened);

      store.setFrontLidState(LidState.Unknown);
      expect(store.frontLidState).toBe(LidState.Unknown);
    });

    it('should handle multiple state transitions for back lid', () => {
      store.setBackLidState(LidState.Closed);
      expect(store.backLidState).toBe(LidState.Closed);

      store.setBackLidState(LidState.Opened);
      expect(store.backLidState).toBe(LidState.Opened);

      store.setBackLidState(LidState.Unknown);
      expect(store.backLidState).toBe(LidState.Unknown);
    });

    it('should handle independent state changes for both lids', () => {
      store.setFrontLidState(LidState.Opened);
      store.setBackLidState(LidState.Closed);
      expect(store.frontLidState).toBe(LidState.Opened);
      expect(store.backLidState).toBe(LidState.Closed);

      store.setFrontLidState(LidState.Closed);
      store.setBackLidState(LidState.Opened);
      expect(store.frontLidState).toBe(LidState.Closed);
      expect(store.backLidState).toBe(LidState.Opened);
    });
  });
});
