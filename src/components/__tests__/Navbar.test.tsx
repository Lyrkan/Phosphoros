import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { SerialServiceContextProvider } from '../../contexts/SerialServiceContext';
import { OutgoingMessage, OutgoingMessageType } from '../../types/Messages';

// Mock the SerialService
const mockSerialService = {
  connect: jest.fn<Promise<void>, [boolean?]>(),
  disconnect: jest.fn(),
  isConnected: jest.fn().mockReturnValue(true),
  sendCommand: jest.fn<Promise<OutgoingMessage>, [OutgoingMessageType, unknown]>()
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <SerialServiceContextProvider value={mockSerialService}>
        {ui}
      </SerialServiceContextProvider>
    </MemoryRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders brand and navigation links', () => {
    renderWithRouter(<Navbar />);

    // Check brand
    expect(screen.getByText('Phosphoros')).toBeInTheDocument();
    expect(screen.getByAltText('Phosphoros')).toBeInTheDocument();

    // Check navigation links
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });

  it('renders reconnect button', () => {
    renderWithRouter(<Navbar />);

    expect(screen.getByText('Reconnect')).toBeInTheDocument();
  });

  it('calls connect when reconnect button is clicked', async () => {
    renderWithRouter(<Navbar />);

    const reconnectButton = screen.getByText('Reconnect');
    fireEvent.click(reconnectButton);

    expect(mockSerialService.connect).toHaveBeenCalled();
  });

  it('handles connect error gracefully', async () => {
    mockSerialService.connect.mockRejectedValueOnce(new Error('Connection failed'));
    renderWithRouter(<Navbar />);

    const reconnectButton = screen.getByText('Reconnect');
    await fireEvent.click(reconnectButton);

    // The error is handled silently as per the component's implementation
    expect(mockSerialService.connect).toHaveBeenCalled();
  });
});

