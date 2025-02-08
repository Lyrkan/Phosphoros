import { renderHook } from '@testing-library/react';
import { useSettings } from '../useSettings';
import { useStore } from '../../stores/RootStore';

// Mock dependencies
jest.mock('../../stores/RootStore');

describe('useSettings', () => {
  const mockSettingsStore = {
    grbl: {
      default_timeout_ms: 1000,
      homing_timeout_ms: 5000
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useStore as jest.Mock).mockReturnValue({
      settingsStore: mockSettingsStore
    });
  });

  it('should return the settings store from root store', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current).toBe(mockSettingsStore);
  });

  it('should use the root store context', () => {
    renderHook(() => useSettings());
    expect(useStore).toHaveBeenCalled();
  });
});
