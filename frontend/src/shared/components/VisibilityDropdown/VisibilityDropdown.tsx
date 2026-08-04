import './VisibilityDropdown.scss';

import { memo } from 'react';
import { BlogVisibility } from '../../../types';

type VisibilityDropdownProps = {
  value: BlogVisibility;
  onChange: (value: BlogVisibility) => void;
  disabled?: boolean;
};

export const VisibilityDropdown = memo(function VisibilityDropdown({
  value,
  onChange,
  disabled = false,
}: VisibilityDropdownProps) {
  const options = [
    { value: BlogVisibility.Public, label: '🌍 Public' },
    { value: BlogVisibility.FriendsOnly, label: '👥 Friends Only' },
    { value: BlogVisibility.Private, label: '🔒 Private' },
  ];

  return (
    <select
      className="visibility-dropdown"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as BlogVisibility)}
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
