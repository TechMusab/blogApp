import { request } from '../utils/api';
import type { ConversationDto, MessageDto } from '../types';

export type PagedMessagesResponse = {
  items: MessageDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type CreateConversationRequest = {
  userId: number;
};

export type SendMessageRequest = {
  content: string;
};

export const ChatService = {
  async getConversations(token: string | null): Promise<ConversationDto[]> {
    return request<ConversationDto[]>('/chat/conversations', {}, token ?? undefined);
  },

  async createConversation(targetUserId: number, token: string | null): Promise<ConversationDto> {
    const response = await request<ConversationDto>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId }),
    }, token ?? undefined);
    return response;
  },

  async getMessages(
    conversationId: number,
    pageNumber: number = 1,
    pageSize: number = 30,
    token: string | null
  ): Promise<PagedMessagesResponse> {
    return request<PagedMessagesResponse>(
      `/chat/conversations/${conversationId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {},
      token ?? undefined
    );
  },

  async sendMessage(conversationId: number, content: string, token: string | null): Promise<MessageDto> {
    return request<MessageDto>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, token ?? undefined);
  },

  async markAsRead(conversationId: number, token: string | null): Promise<void> {
    return request<void>(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    }, token ?? undefined);
  },

  async deleteMessage(messageId: number, token: string | null): Promise<void> {
    return request<void>(`/chat/messages/${messageId}`, {
      method: 'DELETE',
    }, token ?? undefined);
  },
};
