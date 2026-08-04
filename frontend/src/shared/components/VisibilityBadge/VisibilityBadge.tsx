import './VisibilityBadge.scss';

import { memo } from 'react';
import { BlogVisibility } from '../../../types';

type VisibilityBadgeProps = {
  visibility: BlogVisibility;
};

export const VisibilityBadge = memo(function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const getVisibilityInfo = () => {
    switch (visibility) {
      case BlogVisibility.Public:
        return { icon: '🌍', label: 'Public', className: 'visibility-badge--public' };
      case BlogVisibility.FriendsOnly:
        return { icon: '👥', label: 'Friends', className: 'visibility-badge--friends' };
      case BlogVisibility.Private:
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
