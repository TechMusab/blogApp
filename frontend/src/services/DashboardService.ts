import { request } from '../utils/api';

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
  async getStats(token?: string | null): Promise<DashboardStats> {
    return request<DashboardStats>('/user/dashboard/stats', undefined, token ?? undefined);
  },
};
