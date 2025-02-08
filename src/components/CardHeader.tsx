import React from 'react';
import { Card, Badge } from 'react-bootstrap';

interface CardHeaderProps {
  icon: string;
  title: string;
  status?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  };
  note?: string;
  extra?: React.ReactNode;
}

const cardHeaderStyle = (variant: string) => ({
  fontWeight: 'bold' as const,
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: variant === 'danger' ? 'var(--bs-danger-bg-subtle)' : 'var(--bs-primary)',
});

export default function CardHeader({ icon, title, status, note, extra }: CardHeaderProps) {
  return (
    <Card.Header className="border-primary text-white" style={cardHeaderStyle(status?.variant || 'primary')}>
      <i data-testid="header-icon" className={`bi ${icon}`}></i>
      <span>{title}</span>

      { extra }

      {note && (
        <div className="text-white-50 small ms-auto fw-normal">({note})</div>
      )}

      {status && (
        <Badge bg={status.variant} className="ms-auto">
          {status.text}
        </Badge>
      )}
    </Card.Header>
  );
}
