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
  async getAllUsers(search?: string, filter?: string): Promise<UserProfile[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    const query = params.toString();
    return request<UserProfile[]>(`/user/all${query ? `?${query}` : ''}`, undefined, token);
  },

  async getFriends(): Promise<UserProfile[]> {
    const token = localStorage.getItem('token');
    return request<UserProfile[]>('/friends', undefined, token);
  },

  async getIncomingRequests(): Promise<FriendRequest[]> {
    const token = localStorage.getItem('token');
    return request<FriendRequest[]>('/friends/requests/incoming', undefined, token);
  },

  async getOutgoingRequests(): Promise<FriendRequest[]> {
    const token = localStorage.getItem('token');
    return request<FriendRequest[]>('/friends/requests/outgoing', undefined, token);
  },

  async sendFriendRequest(receiverId: number): Promise<FriendRequestResponse> {
    const token = localStorage.getItem('token');
    return request<FriendRequestResponse>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiverId }),
    }, token);
  },

  async acceptFriendRequest(requestId: number): Promise<FriendRequestResponse> {
    const token = localStorage.getItem('token');
    return request<FriendRequestResponse>(`/friends/accept/${requestId}`, {
      method: 'POST',
    }, token);
  },

  async rejectFriendRequest(requestId: number): Promise<FriendRequestResponse> {
    const token = localStorage.getItem('token');
    return request<FriendRequestResponse>(`/friends/reject/${requestId}`, {
      method: 'POST',
    }, token);
  },

  async cancelFriendRequest(requestId: number): Promise<FriendRequestResponse> {
    const token = localStorage.getItem('token');
    return request<FriendRequestResponse>(`/friends/cancel/${requestId}`, {
      method: 'POST',
    }, token);
  },

  async removeFriend(friendId: number): Promise<FriendRequestResponse> {
    const token = localStorage.getItem('token');
    return request<FriendRequestResponse>(`/friends/remove/${friendId}`, {
      method: 'DELETE',
    }, token);
  },
};
