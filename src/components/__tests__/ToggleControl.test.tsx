import { render, screen, fireEvent } from '@testing-library/react';
import ToggleControl from '../ToggleControl';

describe('ToggleControl', () => {
  const defaultProps = {
    icon: 'bi-lightbulb',
    label: 'Toggle Light',
    isActive: false,
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ToggleControl {...defaultProps} />);

    expect(screen.getByText('Toggle Light')).toBeInTheDocument();
    const icon = screen.getByTestId('toggle-icon');
    expect(icon).toHaveClass('bi-lightbulb');
  });

  it('renders with active state', () => {
    render(<ToggleControl {...defaultProps} isActive={true} />);

    const container = screen.getByRole('button');
    expect(container).toHaveStyle({
      backgroundColor: 'var(--bs-primary)',
      color: 'var(--bs-white)'
    });
  });

  it('uses activeIcon when provided and active', () => {
    render(
      <ToggleControl
        {...defaultProps}
        isActive={true}
        activeIcon="bi-lightbulb-fill"
      />
    );

    const icon = screen.getByTestId('toggle-icon');
    expect(icon).toHaveClass('bi-lightbulb-fill');
  });

  it('calls onChange with toggled value when clicked', () => {
    render(<ToggleControl {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(defaultProps.onChange).toHaveBeenCalledWith(true);
  });

  it('applies custom className', () => {
    render(<ToggleControl {...defaultProps} className="custom-class" />);

    const container = screen.getByRole('button');
    expect(container).toHaveClass('custom-class');
  });

  it('maintains base styles with custom className', () => {
    render(<ToggleControl {...defaultProps} className="custom-class" />);

    const container = screen.getByRole('button');
    expect(container).toHaveStyle({
      display: 'flex',
      flexDirection: 'row',
      gap: '8px',
      height: '45px',
      cursor: 'pointer'
    });
  });
});

