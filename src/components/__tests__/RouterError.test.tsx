import { render, screen } from '@testing-library/react';
import { useRouteError } from 'react-router';
import RouterError from '../RouterError';

// Mock useRouteError hook
jest.mock('react-router', () => ({
  useRouteError: jest.fn()
}));

describe('RouterError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error statusText when available', () => {
    (useRouteError as jest.Mock).mockReturnValue({
      statusText: 'Not Found'
    });

    render(<RouterError />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('renders error message when statusText is not available', () => {
    (useRouteError as jest.Mock).mockReturnValue({
      message: 'Page not found'
    });

    render(<RouterError />);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('renders error icon', () => {
    (useRouteError as jest.Mock).mockReturnValue({
      message: 'Error'
    });

    render(<RouterError />);
    const icon = screen.getByTestId('error-icon');
    expect(icon).toHaveClass('bi', 'bi-emoji-frown-fill');
  });
});

