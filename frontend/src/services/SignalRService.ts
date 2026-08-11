import * as signalR from '@microsoft/signalr';
import { BACKEND_BASE_URL } from '../utils/api';
import type { MessageDto } from '../types';

type SignalREventHandlers = {
  receiveMessage: (message: MessageDto) => void;
  messageRead: (conversationId: number, userId: number) => void;
  userTyping: (conversationId: number, userId: number) => void;
  userStoppedTyping: (conversationId: number, userId: number) => void;
  messageDeleted: (messageId: number) => void;
  onReconnecting: () => void;
  onReconnected: () => void;
  onClose: () => void;
};

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers: SignalREventHandlers = {
    receiveMessage: () => {},
    messageRead: () => {},
    userTyping: () => {},
    userStoppedTyping: () => {},
    messageDeleted: () => {},
    onReconnecting: () => {},
    onReconnected: () => {},
    onClose: () => {},
  };
  private currentConversationId: number | null = null;
  private isInitialized = false;
  private eventHandlersRegistered = false;

  async startConnection(token: string): Promise<void> {
    // Prevent multiple connections
    if (this.connection?.state === signalR.HubConnectionState.Connected || 
        this.connection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    // Stop existing connection if any
    if (this.connection) {
      await this.stopConnection();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BACKEND_BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          return delay + Math.random() * 1000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupConnectionLifecycle();

    try {
      await this.connection.start();
      this.isInitialized = true;
      
      // Setup event handlers AFTER connection is established
      this.setupEventHandlers();

      // Re-join current conversation if we have one
      if (this.currentConversationId) {
        await this.joinConversation(this.currentConversationId);
      }
    } catch (err) {
      this.isInitialized = false;
      throw err;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        // Leave current conversation before disconnecting
        if (this.currentConversationId) {
          await this.leaveConversation(this.currentConversationId);
        }
        
        await this.connection.stop();
      } catch (err) {
        // Ignore disconnect errors
      } finally {
        this.connection = null;
        this.isInitialized = false;
        this.currentConversationId = null;
      }
    }
  }

  private setupConnectionLifecycle(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((_error) => {
      this.eventHandlers.onReconnecting();
    });

    this.connection.onreconnected((_connectionId) => {
      this.eventHandlers.onReconnected();
      
      // Re-join current conversation after reconnection
      if (this.currentConversationId) {
        this.joinConversation(this.currentConversationId).catch(() => {
          // Ignore re-join errors
        });
      }
    });

    this.connection.onclose((_error) => {
      this.eventHandlers.onClose();
      this.isInitialized = false;
    });
  }

  private setupEventHandlers(): void {
    if (!this.connection || this.eventHandlersRegistered) {
      return;
    }

    // Remove existing handlers to prevent duplicates
    this.connection.off('ReceiveMessage');
    this.connection.off('receivemessage');
    this.connection.off('MessageRead');
    this.connection.off('messageread');
    this.connection.off('UserTyping');
    this.connection.off('usertyping');
    this.connection.off('UserStoppedTyping');
    this.connection.off('userstoppedtyping');
    this.connection.off('MessageDeleted');
    this.connection.off('messagedeleted');

    // SignalR converts to lowercase for JSON protocol
    this.connection.on('receivemessage', (message: MessageDto) => {
      this.eventHandlers.receiveMessage(message);
    });

    this.connection.on('messageread', (conversationId: number, userId: number) => {
      this.eventHandlers.messageRead(conversationId, userId);
    });

    this.connection.on('usertyping', (conversationId: number, userId: number) => {
      this.eventHandlers.userTyping(conversationId, userId);
    });

    this.connection.on('userstoppedtyping', (conversationId: number, userId: number) => {
      this.eventHandlers.userStoppedTyping(conversationId, userId);
    });

    this.connection.on('messagedeleted', (messageId: number) => {
      this.eventHandlers.messageDeleted(messageId);
    });

    this.eventHandlersRegistered = true;
  }

  removeAllEventHandlers(): void {
    if (!this.connection) return;
    
    this.connection.off('ReceiveMessage');
    this.connection.off('MessageRead');
    this.connection.off('UserTyping');
    this.connection.off('UserStoppedTyping');
    this.connection.off('MessageDeleted');
    
    // Reset handlers to no-ops
    this.eventHandlers = {
      receiveMessage: () => {},
      messageRead: () => {},
      userTyping: () => {},
      userStoppedTyping: () => {},
      messageDeleted: () => {},
      onReconnecting: () => {},
      onReconnected: () => {},
      onClose: () => {},
    };
  }

  onReceiveMessage(handler: (message: MessageDto) => void): void {
    this.eventHandlers.receiveMessage = handler;
  }

  onMessageRead(handler: (conversationId: number, userId: number) => void): void {
    this.eventHandlers.messageRead = handler;
  }

  onUserTyping(handler: (conversationId: number, userId: number) => void): void {
    this.eventHandlers.userTyping = handler;
  }

  onUserStoppedTyping(handler: (conversationId: number, userId: number) => void): void {
    this.eventHandlers.userStoppedTyping = handler;
  }

  onMessageDeleted(handler: (messageId: number) => void): void {
    this.eventHandlers.messageDeleted = handler;
  }

  onReconnecting(handler: () => void): void {
    this.eventHandlers.onReconnecting = handler;
  }

  onReconnected(handler: () => void): void {
    this.eventHandlers.onReconnected = handler;
  }

  onClose(handler: () => void): void {
    this.eventHandlers.onClose = handler;
  }

  async joinConversation(conversationId: number): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    // Leave previous conversation if different
    if (this.currentConversationId && this.currentConversationId !== conversationId) {
      await this.leaveConversation(this.currentConversationId);
    }

    try {
      await this.connection.invoke('JoinConversation', conversationId);
      this.currentConversationId = conversationId;
    } catch (err) {
      throw err;
    }
  }

  async leaveConversation(conversationId: number): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('LeaveConversation', conversationId);
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null;
      }
    } catch (err) {
      // Ignore leave errors
    }
  }

  async sendMessage(conversationId: number, content: string): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('SendMessage', conversationId, content);
    } catch (err) {
      throw err;
    }
  }

  async markAsRead(conversationId: number): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('MarkAsRead', conversationId);
    } catch (err) {
      // Ignore mark as read errors
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('DeleteMessage', messageId);
    } catch (err) {
      // Ignore delete errors
    }
  }

  async typingStart(conversationId: number): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('TypingStart', conversationId);
    } catch (err) {
      // Ignore typing start errors
    }
  }

  async typingStop(conversationId: number): Promise<void> {
    if (!this.isInitialized || this.connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('TypingStop', conversationId);
    } catch (err) {
      // Ignore typing stop errors
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getCurrentConversationId(): number | null {
    return this.currentConversationId;
  }
}

export const signalRService = new SignalRService();
