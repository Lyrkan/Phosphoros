import React from 'react';
import { Card, Badge } from 'react-bootstrap';

interface CardHeaderProps {
  icon: string;
  title: string;
  status?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  };
}

const cardHeaderStyle = (variant: string) => ({
  fontWeight: 'bold' as const,
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: variant === 'danger' ? 'var(--bs-danger-bg-subtle)' : 'var(--bs-primary)',
});

export default function CardHeader({ icon, title, status }: CardHeaderProps) {
  return (
    <Card.Header className="border-primary text-white" style={cardHeaderStyle(status?.variant || 'primary')}>
      <i className={`bi ${icon}`}></i>
      <span>{title}</span>
      {status && (
        <Badge bg={status.variant} className="ms-auto">
          {status.text}
        </Badge>
      )}
    </Card.Header>
  );
}
