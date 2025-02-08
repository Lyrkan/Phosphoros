import { render, screen, fireEvent } from '@testing-library/react';
import AxisControl from '../AxisControl';

describe('AxisControl', () => {
  const defaultProps = {
    axis: 'X' as const,
    position: 10.5,
    onMove: jest.fn(),
    onHome: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders axis label and position correctly', () => {
    render(<AxisControl {...defaultProps} />);

    expect(screen.getByText('X axis:')).toBeInTheDocument();
    expect(screen.getByText('10.5')).toBeInTheDocument();
    expect(screen.getByText('mm')).toBeInTheDocument();
  });

  it('renders default increment buttons', () => {
    render(<AxisControl {...defaultProps} />);

    // Check negative increments
    expect(screen.getByText('-100')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByText('-0.1')).toBeInTheDocument();

    // Check positive increments
    expect(screen.getByText('+0.1')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('+100')).toBeInTheDocument();
  });

  it('renders custom increment buttons when provided', () => {
    render(<AxisControl {...defaultProps} increments={[1, 5, 25]} />);

    // Check negative increments
    expect(screen.getByText('-25')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();

    // Check positive increments
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('+25')).toBeInTheDocument();
  });

  it('calls onMove with correct increment when buttons are clicked', () => {
    render(<AxisControl {...defaultProps} />);

    // Test negative increment
    fireEvent.click(screen.getByText('-10'));
    expect(defaultProps.onMove).toHaveBeenCalledWith(-10);

    // Test positive increment
    fireEvent.click(screen.getByText('+1'));
    expect(defaultProps.onMove).toHaveBeenCalledWith(1);
  });

  it('calls onHome when home button is clicked', () => {
    render(<AxisControl {...defaultProps} />);

    fireEvent.click(screen.getByText('Home'));
    expect(defaultProps.onHome).toHaveBeenCalled();
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<AxisControl {...defaultProps} disabled={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button: HTMLElement) => {
      expect(button).toBeDisabled();
    });
  });

  it('enables all buttons when disabled prop is false', () => {
    render(<AxisControl {...defaultProps} disabled={false} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button: HTMLElement) => {
      expect(button).not.toBeDisabled();
    });
  });
});

