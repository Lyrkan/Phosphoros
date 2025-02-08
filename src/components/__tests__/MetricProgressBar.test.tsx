import { render, screen, fireEvent } from '@testing-library/react';
import MetricProgressBar from '../MetricProgressBar';

describe('MetricProgressBar', () => {
  const defaultProps = {
    label: 'Test Metric',
    value: 50,
    unit: '%',
    min: 0,
    max: 100
  };

  it('renders label and value with unit', () => {
    render(<MetricProgressBar {...defaultProps} />);

    expect(screen.getByText('Test Metric:')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('shows "Unknown" when value is undefined', () => {
    render(<MetricProgressBar {...defaultProps} value={undefined} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('applies custom variant', () => {
    render(<MetricProgressBar {...defaultProps} variant="danger" />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-danger');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricProgressBar {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles click when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<MetricProgressBar {...defaultProps} onClick={handleClick} />);

    const container = screen.getByRole('button');
    fireEvent.click(container);

    expect(handleClick).toHaveBeenCalled();
  });

  it('shows search icon when onClick is provided', () => {
    const mockClick = jest.fn();
    render(<MetricProgressBar {...defaultProps} onClick={mockClick} />);

    const icon = screen.getByTestId('search-icon');
    expect(icon).toHaveClass('bi', 'bi-search');
  });

  it('applies danger background style when variant is danger', () => {
    render(<MetricProgressBar {...defaultProps} variant="danger" />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({
      backgroundColor: 'var(--bs-danger-bg-subtle)'
    });
  });
});

