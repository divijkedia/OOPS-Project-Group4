import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { NotificationResponse } from '../types/notification';

export const notificationsApi = {
  async getNotifications(): Promise<NotificationResponse[]> {
    const res = await apiClient.get<ApiResponse<NotificationResponse[]>>('/notifications');
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<ApiResponse<number>>('/notifications/unread-count');
    return res.data.data;
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<ApiResponse<void>>('/notifications/read-all');
  },
};
