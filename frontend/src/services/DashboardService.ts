import { api } from './api';

export type DashboardStats = {
  totalPosts: number;
  publicPosts: number;
  friendsOnlyPosts: number;
  privatePosts: number;
  friendsCount: number;
  pendingRequests: number;
  receivedRequests: number;
};

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/user/dashboard/stats');
    return response.data;
  },
};
