import { request } from '../utils/api';
import type { Notification } from '../types';

type UnreadCountResponse = {
  count: number;
};

type NotificationsResponse = {
  items: Notification[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export const NotificationsService = {
  getUnreadCount: (token: string | null) =>
    request<UnreadCountResponse>('/notifications/unread-count', {}, token),
  getNotifications: (token: string | null, pageNumber: number = 1, pageSize: number = 20) =>
    request<NotificationsResponse>(`/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`, {}, token),
  markAllAsRead: (token: string | null) =>
    request<void>('/notifications/read-all', { method: 'PATCH' }, token),
  markAsRead: (notificationId: number, token: string | null) =>
    request<void>(`/notifications/${notificationId}/read`, { method: 'PATCH' }, token),
};
