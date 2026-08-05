import './SortToggle.scss';

import { memo } from 'react';

type SortToggleProps = {
  options: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeSort: string;
  onChange: (id: string) => void;
};

export const SortToggle = memo(function SortToggle({ options, activeSort, onChange }: SortToggleProps) {
  return (
    <div className="sort-toggle">
      {options.map((option) => (
        <button
          key={option.id}
          className={`sort-toggle__item ${activeSort === option.id ? 'sort-toggle__item--active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.icon && <span className="sort-toggle__icon">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
});
