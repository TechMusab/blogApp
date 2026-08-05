import './VisibilityDropdown.scss';

import { memo } from 'react';
import { Globe, Users, Lock } from 'lucide-react';

type VisibilityDropdownProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export const VisibilityDropdown = memo(function VisibilityDropdown({
  value,
  onChange,
  disabled = false,
}: VisibilityDropdownProps) {
  const options = [
    { value: 0, label: 'Public', subtitle: 'Anyone can read', icon: Globe },
    { value: 1, label: 'Friends only', subtitle: 'Only your friends', icon: Users },
    { value: 2, label: 'Private', subtitle: 'Only you can read', icon: Lock },
  ];

  return (
    <div className="visibility-selector">
      <h3 className="visibility-selector__title">VISIBILITY</h3>
      <div className="visibility-selector__cards">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`visibility-card ${isActive ? 'visibility-card--active' : ''}`}
              onClick={() => onChange(option.value)}
              disabled={disabled}
            >
              <div className="visibility-card__icon">
                <Icon size={24} />
              </div>
              <div className="visibility-card__content">
                <div className="visibility-card__label">{option.label}</div>
                <div className="visibility-card__subtitle">{option.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
