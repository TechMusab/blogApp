import './VisibilityBadge.scss';

import { memo } from 'react';

type VisibilityBadgeProps = {
  visibility: number;
};

export const VisibilityBadge = memo(function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const getVisibilityInfo = () => {
    switch (visibility) {
      case 0:
        return { icon: '🌍', label: 'Public', className: 'visibility-badge--public' };
      case 1:
        return { icon: '👥', label: 'Friends', className: 'visibility-badge--friends' };
      case 2:
        return { icon: '🔒', label: 'Private', className: 'visibility-badge--private' };
      default:
        return { icon: '🌍', label: 'Public', className: 'visibility-badge--public' };
    }
  };

  const { icon, label, className } = getVisibilityInfo();

  return (
    <span className={`visibility-badge ${className}`}>
      {icon} {label}
    </span>
  );
});
