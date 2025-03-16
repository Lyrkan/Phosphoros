import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';

interface AxisControlProps {
  axis: 'X' | 'Y' | 'Z';
  position: number;
  onMove: (increment: number) => void;
  onHome: () => void;
  increments?: number[];
  disabled?: boolean;
  className?: string;
}

export default function AxisControl({
  axis,
  position,
  onMove,
  onHome,
  increments = [0.1, 1, 10, 100],
  disabled = false,
  className = '',
}: AxisControlProps) {
  // Generate negative increments by mapping the positive ones
  const negativeIncrements = [...increments].reverse().map(n => -n);
  const positiveIncrements = increments;

  return (
    <Row className={`align-items-center ${className}`}>
      <Col xs={3}>
        <strong>{axis} axis:</strong>{' '}
        <span className="font-monospace" style={{ display: 'inline-block', width: '7ch', textAlign: 'right' }}>
          {position.toFixed(1)}
        </span>
        {' '}mm
      </Col>
      <Col>
        <ButtonGroup className="gap-1">
          {negativeIncrements.map((increment) => (
            <Button
              key={increment}
              variant="primary"
              onClick={() => onMove(increment)}
              style={{ width: '4.5rem', whiteSpace: 'nowrap' }}
              disabled={disabled}
            >
              {increment}
            </Button>
          ))}
          <Button
            variant="primary"
            size="sm"
            onClick={onHome}
            disabled={disabled}
          >
            <i className="bi bi-house-door"></i> Home
          </Button>
          {positiveIncrements.map((increment) => (
            <Button
              key={increment}
              variant="primary"
              onClick={() => onMove(increment)}
              style={{ width: '4.5rem', whiteSpace: 'nowrap' }}
              disabled={disabled}
            >
              +{increment}
            </Button>
          ))}
        </ButtonGroup>
      </Col>
    </Row>
  );
}
