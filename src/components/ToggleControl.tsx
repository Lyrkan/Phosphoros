import { observer } from 'mobx-react-lite';

interface ToggleControlProps {
  icon: string;
  activeIcon?: string;
  label: string;
  isActive: boolean;
  onChange: (newValue: boolean) => void;
  className?: string;
}

const ToggleControl = observer(({
  icon,
  activeIcon,
  label,
  isActive,
  onChange,
  className = ''
}: ToggleControlProps) => {
  const handleClick = () => {
    onChange(!isActive);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        height: '45px',
        border: '1px solid var(--bs-primary)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--bs-gray)',
        ...(isActive && {
          backgroundColor: 'var(--bs-primary)',
          color: 'var(--bs-white)'
        })
      }}
      className={className}
      onClick={handleClick}
      role="button"
    >
        <i data-testid="toggle-icon" className={`${isActive ? (activeIcon ?? icon) : icon}`}></i>
        <span>{label}</span>
    </div>
  );
});

export default ToggleControl;
