import { memo, useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { NotificationsService } from '../../../services/NotificationsService';
import { NotificationDropdown } from '../NotificationDropdown/NotificationDropdown';
import type { RootState } from '../../../redux/store';

export const NotificationBell = memo(function NotificationBell() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await NotificationsService.getUnreadCount(token);
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleCloseDropdown = () => {
    setDropdownOpen(false);
    // Refresh unread count after closing dropdown
    fetchUnreadCount();
  };

  const handleNotificationRead = () => {
    // Refresh unread count when a notification is marked as read
    fetchUnreadCount();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="dashboard__notification-btn"
        aria-label="Notifications"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        onClick={handleToggleDropdown}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="dashboard__notification-badge"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#e8ac3a',
              color: '#111111',
              fontSize: '10px',
              fontWeight: '600',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationDropdown open={dropdownOpen} onClose={handleCloseDropdown} onNotificationRead={handleNotificationRead} />
    </div>
  );
});
