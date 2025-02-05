import { ReactElement } from 'react';

interface StatusItemProps {
  label: string;
  value: string;
  badge?: ReactElement;
  className?: string;
  marquee?: boolean;
}

const StatusItem = ({ label, value, badge, className = 'mb-3', marquee = false }: StatusItemProps) => {
  const marqueeContainerStyle = {
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    position: 'relative' as const,
    flex: '1',
  };

  const marqueeTextStyle = {
    display: 'inline-block',
    animation: 'marquee 15s linear infinite',
  };

  return (
    <div className={`d-flex align-items-center gap-1 ${className}`}>
      <strong className="text-nowrap">{label}:</strong>
      {marquee ? (
        <span style={marqueeContainerStyle}>
          <span className="fw-light" style={value.length > 20 ? marqueeTextStyle : undefined}>
            {value}
          </span>
        </span>
      ) : (
        <span className="flex-grow-1 fw-light">{value}</span>
      )}
      {badge}
    </div>
  );
};

export default StatusItem;
