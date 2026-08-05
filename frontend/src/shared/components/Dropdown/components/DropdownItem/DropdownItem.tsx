import './DropdownItem.scss';

import { memo } from 'react';
import type { ReactNode } from 'react';

export type DropdownMenuItem = {
  label: string;
  icon: ReactNode;
  danger?: boolean;
  onClick: () => void;
  className?: string;
};

export const DropdownItem = memo(function DropdownItem({
  label,
  icon,
  danger,
  onClick,
  className,
}: DropdownMenuItem) {
  return (
    <button
      type="button"
      className={`dropdown-item${danger ? ' dropdown-item--danger' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      <span className="dropdown-item__icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  );
});
