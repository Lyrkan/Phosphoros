// Create navigator if it doesn't exist
global.navigator = global.navigator || {};

// Mock Serial API
const mockSerial = {
  getPorts: jest.fn(),
  requestPort: jest.fn(),
};
global.navigator.serial = mockSerial;
