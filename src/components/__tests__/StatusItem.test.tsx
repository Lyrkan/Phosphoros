import { render, screen } from '@testing-library/react';
import StatusItem from '../StatusItem';

describe('StatusItem', () => {
  it('renders label and value correctly', () => {
    render(<StatusItem label="Test Label" value="Test Value" />);

    expect(screen.getByText('Test Label:')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<StatusItem label="Test" value="Value" />);
    expect(container.firstChild).toHaveClass('mb-3');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatusItem label="Test" value="Value" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders badge when provided', () => {
    render(
      <StatusItem
        label="Test"
        value="Value"
        badge={<span data-testid="test-badge">Badge</span>}
      />
    );
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('applies marquee styles for long text when marquee is true', () => {
    const longValue = 'This is a very long value that should trigger the marquee effect';
    render(<StatusItem label="Test" value={longValue} marquee={true} />);

    const marqueeElement = screen.getByText(longValue);
    expect(marqueeElement).toHaveStyle({ animation: 'marquee 15s linear infinite' });
  });

  it('does not apply marquee styles for short text even when marquee is true', () => {
    const shortValue = 'Short value';
    render(<StatusItem label="Test" value={shortValue} marquee={true} />);

    const textElement = screen.getByText(shortValue);
    expect(textElement).not.toHaveStyle({ animation: 'marquee 15s linear infinite' });
  });
});

