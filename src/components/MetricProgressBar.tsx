import { Col, ProgressBar, Row } from 'react-bootstrap';

interface MetricProgressBarProps {
  label: string;
  value: number | undefined;
  unit: string;
  min: number;
  max: number;
  variant?: string;
  onClick?: () => void;
  className?: string;
}

const MetricProgressBar = ({ label, value, unit, min, max, variant = 'primary', onClick, className = 'mb-3' }: MetricProgressBarProps) => {
  const progressBarContainerStyle = {
    height: '2rem',
    fontSize: '1rem',
    position: 'relative' as const,
  };

  const progressLabelStyle = {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    zIndex: 1,
    fontSize: '.9em',
  };

  const searchIconStyle = {
    position: 'absolute' as const,
    right: '.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    color: 'var(--bs-body-color)',
    opacity: 0.5,
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    margin: 0,
  };

  const progressBarStyle = {
    height: '100%',
    backgroundColor: (variant === 'danger' ? 'var(--bs-danger-bg-subtle)' : 'var(--bs-progress-bg)'),
  };

  return (
    <Row className={className}>
      <Col xs={4} style={labelStyle}><strong>{label}:</strong></Col>
      <Col xs={8}>
        <div style={progressBarContainerStyle} onClick={onClick} role={onClick ? "button" : undefined}>
          <div style={progressLabelStyle}>
            {value !== undefined ? `${value.toFixed(1)}${unit}` : 'Unknown'}
          </div>
          <ProgressBar
            style={progressBarStyle}
            min={min}
            max={max}
            now={value}
            variant={variant}
          />
          {onClick && <i className="bi bi-search" style={searchIconStyle}></i>}
        </div>
      </Col>
    </Row>
  );
};

export default MetricProgressBar;

