import { api } from './api';
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
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    const query = params.toString();
    const response = await api.get(`/user/all${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getFriends(): Promise<UserProfile[]> {
    const response = await api.get('/friends');
    return response.data;
  },

  async getIncomingRequests(): Promise<FriendRequest[]> {
    const response = await api.get('/friends/requests/incoming');
    return response.data;
  },

  async getOutgoingRequests(): Promise<FriendRequest[]> {
    const response = await api.get('/friends/requests/outgoing');
    return response.data;
  },

  async sendFriendRequest(receiverId: number): Promise<FriendRequestResponse> {
    const response = await api.post('/friends/request', { receiverId });
    return response.data;
  },

  async acceptFriendRequest(requestId: number): Promise<FriendRequestResponse> {
    const response = await api.post(`/friends/accept/${requestId}`);
    return response.data;
  },

  async rejectFriendRequest(requestId: number): Promise<FriendRequestResponse> {
    const response = await api.post(`/friends/reject/${requestId}`);
    return response.data;
  },

  async cancelFriendRequest(requestId: number): Promise<FriendRequestResponse> {
    const response = await api.post(`/friends/cancel/${requestId}`);
    return response.data;
  },

  async removeFriend(friendId: number): Promise<FriendRequestResponse> {
    const response = await api.delete(`/friends/remove/${friendId}`);
    return response.data;
  },
};
