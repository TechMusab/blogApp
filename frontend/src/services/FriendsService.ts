import { request } from '../utils/api';
import type { UserProfile, FriendRequestStatus } from '../types';

export type FriendRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt?: string;
  senderName: string;
  senderEmail: string;
  senderAvatar: string;
  receiverName: string;
  receiverEmail: string;
  receiverAvatar: string;
};

export type SendFriendRequestRequest = {
  receiverId: number;
};

export type FriendRequestResponse = {
  message: string;
  friendRequest?: FriendRequest;
};

export const FriendsService = {
  async getAllUsers(search?: string, filter?: string, token?: string | null): Promise<UserProfile[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    const query = params.toString();
    return request<UserProfile[]>(`/user/all${query ? `?${query}` : ''}`, undefined, token ?? undefined);
  },

  async getFriends(token?: string | null): Promise<UserProfile[]> {
    return request<UserProfile[]>('/friends', undefined, token ?? undefined);
  },

  async getIncomingRequests(token?: string | null): Promise<FriendRequest[]> {
    return request<FriendRequest[]>('/friends/requests/incoming', undefined, token ?? undefined);
  },

  async getOutgoingRequests(token?: string | null): Promise<FriendRequest[]> {
    return request<FriendRequest[]>('/friends/requests/outgoing', undefined, token ?? undefined);
  },

  async sendFriendRequest(receiverId: number, token?: string | null): Promise<FriendRequestResponse> {
    return request<FriendRequestResponse>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiverId }),
    }, token ?? undefined);
  },

  async acceptFriendRequest(requestId: number, token?: string | null): Promise<FriendRequestResponse> {
    return request<FriendRequestResponse>(`/friends/accept/${requestId}`, {
      method: 'POST',
    }, token ?? undefined);
  },

  async rejectFriendRequest(requestId: number, token?: string | null): Promise<FriendRequestResponse> {
    return request<FriendRequestResponse>(`/friends/reject/${requestId}`, {
      method: 'POST',
    }, token ?? undefined);
  },

  async cancelFriendRequest(requestId: number, token?: string | null): Promise<FriendRequestResponse> {
    return request<FriendRequestResponse>(`/friends/cancel/${requestId}`, {
      method: 'POST',
    }, token ?? undefined);
  },

  async removeFriend(friendId: number, token?: string | null): Promise<FriendRequestResponse> {
    return request<FriendRequestResponse>(`/friends/remove/${friendId}`, {
      method: 'DELETE',
    }, token ?? undefined);
  },
};
