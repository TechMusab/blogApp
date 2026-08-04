import './VisibilityDropdown.scss';

import { memo } from 'react';

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
    { value: 0, label: '🌍 Public' },
    { value: 1, label: '👥 Friends Only' },
    { value: 2, label: '🔒 Private' },
  ];

  return (
    <select
      className="visibility-dropdown"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
