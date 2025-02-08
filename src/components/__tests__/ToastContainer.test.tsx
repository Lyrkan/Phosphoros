import { render, screen, fireEvent } from '@testing-library/react';
import ToastContainer from '../ToastContainer';
import { useStore } from '../../stores/RootStore';

// Mock the store
jest.mock('../../stores/RootStore', () => ({
  useStore: jest.fn()
}));

describe('ToastContainer', () => {
  const mockToast = {
    id: 1,
    title: 'Test Toast',
    message: 'Test Message',
    variant: 'success' as const,
    autohide: true,
    delay: 3000
  };

  const mockStore = {
    toastStore: {
      toasts: [mockToast],
      remove: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders toast with correct content', () => {
    render(<ToastContainer />);

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('applies correct variant class', () => {
    render(<ToastContainer />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-success');
  });

  it('calls remove when close button is clicked', () => {
    render(<ToastContainer />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockStore.toastStore.remove).toHaveBeenCalledWith(mockToast.id);
  });

  it('renders multiple toasts', () => {
    const multipleToasts = [
      mockToast,
      {
        id: 2,
        title: 'Second Toast',
        message: 'Another Message',
        variant: 'danger' as const,
        autohide: false
      }
    ];

    (useStore as jest.Mock).mockReturnValue({
      toastStore: {
        toasts: multipleToasts,
        remove: jest.fn()
      }
    });

    render(<ToastContainer />);

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Second Toast')).toBeInTheDocument();
    expect(screen.getByText('Another Message')).toBeInTheDocument();
  });

  it('applies text-white class for danger variant', () => {
    const dangerToast = {
      ...mockToast,
      variant: 'danger' as const
    };

    (useStore as jest.Mock).mockReturnValue({
      toastStore: {
        toasts: [dangerToast],
        remove: jest.fn()
      }
    });

    render(<ToastContainer />);

    const toastBody = screen.getByText('Test Message').closest('.toast-body');
    expect(toastBody).toHaveClass('text-white');
  });
});

