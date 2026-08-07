import './NotificationDropdown.scss';

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { NotificationsService } from '../../../services/NotificationsService';
import { Avatar } from '../Avatar';
import type { RootState } from '../../../redux/store';
import type { Notification } from '../../../types';
import { addToast } from '../../../redux/slices/toasts/toastsSlice';
import { useDispatch } from 'react-redux';

type NotificationDropdownProps = {
  open: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const NotificationDropdown = memo(function NotificationDropdown({ open, onClose, onNotificationRead }: NotificationDropdownProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await NotificationsService.getNotifications(token);
      setNotifications(response.items);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!token) return;
    setMarkingAllRead(true);
    try {
      await NotificationsService.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      dispatch(addToast({ message: 'All notifications marked as read', type: 'success' }));
      onNotificationRead?.();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      dispatch(addToast({ message: 'Failed to mark all as read', type: 'error' }));
    } finally {
      setMarkingAllRead(false);
    }
  }, [token, dispatch, onNotificationRead]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!token) return;

    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await NotificationsService.markAsRead(notification.id, token);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        onNotificationRead?.();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'FriendRequest':
        navigate('/friend-requests');
        break;
      case 'FriendRequestAccepted':
        navigate('/friends');
        break;
      case 'Comment':
      case 'Like':
        if (notification.postId) {
          navigate(`/posts/${notification.postId}`);
        }
        break;
      case 'PostSaved':
        if (notification.postId) {
          navigate(`/posts/${notification.postId}`);
        } else {
          navigate('/saved-posts');
        }
        break;
      default:
        break;
    }

    onClose();
  }, [token, navigate, onClose, onNotificationRead]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!open) return;

    const closeFromOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) onClose();
    };

    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', closeFromOutside);
    document.addEventListener('keydown', closeFromEscape);

    return () => {
      document.removeEventListener('mousedown', closeFromOutside);
      document.removeEventListener('keydown', closeFromEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={dropdownRef} className="notification-dropdown">
      <div className="notification-dropdown__header">
        <div className="notification-dropdown__title">
          <Bell size={18} />
          <span>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notification-dropdown__mark-all"
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
          >
            {markingAllRead ? (
              <CheckCheck size={16} />
            ) : (
              <>
                <Check size={16} />
                <span>Mark all</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="notification-dropdown__divider" />

      <div className="notification-dropdown__content">
        {loading ? (
          <div className="notification-dropdown__loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-dropdown__empty">
            <Check size={48} />
            <p>You're all caught up!</p>
            <span>No new notifications.</span>
          </div>
        ) : (
          <div className="notification-dropdown__list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-dropdown__item ${!notification.isRead ? 'notification-dropdown__item--unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-dropdown__avatar">
                  <Avatar
                    avatar={notification.actorAvatar}
                    name={notification.actorName}
                    size="small"
                  />
                </div>
                <div className="notification-dropdown__message">
                  <div className="notification-dropdown__actor">{notification.actorName}</div>
                  <div className="notification-dropdown__text">{notification.message}</div>
                  {notification.postTitle && (
                    <div className="notification-dropdown__post-title">{notification.postTitle}</div>
                  )}
                  <div className="notification-dropdown__time">{formatTimeAgo(notification.createdAt)}</div>
                </div>
                {!notification.isRead && (
                  <div className="notification-dropdown__unread-indicator" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
