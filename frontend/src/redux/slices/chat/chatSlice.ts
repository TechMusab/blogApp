import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ChatService } from '../../../services/ChatService';
import type { ConversationDto, MessageDto } from '../../../types';
import type { RootState } from '../../store';

type ChatState = {
  conversations: ConversationDto[];
  activeConversationId: number | null;
  messages: Record<number, MessageDto[]>;
  typingUsers: number[];
  isLoading: boolean;
  error: string | null;
};

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: [],
  isLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return ChatService.getConversations(token);
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (targetUserId: number, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return ChatService.createConversation(targetUserId, token);
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, pageNumber = 1, pageSize = 30 }: { conversationId: number; pageNumber?: number; pageSize?: number }, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return ChatService.getMessages(conversationId, pageNumber, pageSize, token);
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ conversationId: number; message: MessageDto }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    updateMessage: (state, action: PayloadAction<{ conversationId: number; messageId: number; updates: Partial<MessageDto> }>) => {
      const { conversationId, messageId, updates } = action.payload;
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex] = {
            ...state.messages[conversationId][messageIndex],
            ...updates,
          };
        }
      }
    },
    markConversationAsRead: (state, action: PayloadAction<number>) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(c => c.conversationId === conversationId);
      if (conversation) {
        conversation.unreadMessageCount = 0;
      }
    },
    addTypingUser: (state, action: PayloadAction<number>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<number>) => {
      state.typingUsers = state.typingUsers.filter(id => id !== action.payload);
    },
    updateConversationLastMessage: (state, action: PayloadAction<{ conversationId: number; lastMessage: string; lastMessageAt: string }>) => {
      const { conversationId, lastMessage, lastMessageAt } = action.payload;
      const conversation = state.conversations.find(c => c.conversationId === conversationId);
      if (conversation) {
        conversation.lastMessage = lastMessage;
        conversation.lastMessageAt = lastMessageAt;
        // Move to top
        state.conversations = [conversation, ...state.conversations.filter(c => c.conversationId !== conversationId)];
      }
    },
    incrementUnreadCount: (state, action: PayloadAction<number>) => {
      const conversation = state.conversations.find(c => c.conversationId === action.payload);
      if (conversation && conversation.conversationId !== state.activeConversationId) {
        conversation.unreadMessageCount += 1;
      }
    },
    clearChat: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        const existingIndex = state.conversations.findIndex(c => c.conversationId === action.payload.conversationId);
        if (existingIndex === -1) {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.messages[conversationId] = action.payload.items;
      });
  },
});

export const {
  setActiveConversation,
  addMessage,
  updateMessage,
  markConversationAsRead,
  addTypingUser,
  removeTypingUser,
  updateConversationLastMessage,
  incrementUnreadCount,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
