import { render, screen } from '@testing-library/react';
import CardHeader from '../CardHeader';

describe('CardHeader', () => {
  const defaultProps = {
    icon: 'bi-gear',
    title: 'Test Title'
  };

  it('renders basic header with icon and title', () => {
    render(<CardHeader {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    const icon = screen.getByTestId('header-icon');
    expect(icon).toHaveClass('bi', 'bi-gear');
  });

  it('renders status badge when provided', () => {
    render(
      <CardHeader
        {...defaultProps}
        status={{ text: 'Active', variant: 'success' }}
      />
    );

    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge', 'bg-success');
  });

  it('renders note when provided', () => {
    render(
      <CardHeader
        {...defaultProps}
        note="Additional information"
      />
    );

    expect(screen.getByText('(Additional information)')).toBeInTheDocument();
  });

  it('renders extra content when provided', () => {
    render(
      <CardHeader
        {...defaultProps}
        extra={<span data-testid="extra-content">Extra</span>}
      />
    );

    expect(screen.getByTestId('extra-content')).toBeInTheDocument();
  });

  it('applies danger background style when status variant is danger', () => {
    const { container } = render(
      <CardHeader
        {...defaultProps}
        status={{ text: 'Error', variant: 'danger' }}
      />
    );

    const header = container.firstChild;
    expect(header).toHaveStyle({
      backgroundColor: 'var(--bs-danger-bg-subtle)'
    });
  });
});

