import './ConversationList.scss';

import { memo } from 'react';
import { Avatar } from '../../../../shared/components/Avatar';
import type { ConversationDto } from '../../../../types';

type ConversationListProps = {
  conversations: ConversationDto[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  isLoading: boolean;
};

export const ConversationList = memo(function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (message?: string) => {
    if (!message) return 'No messages yet';
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  if (isLoading) {
    return (
      <div className="conversation-list">
        <div className="conversation-list__loading">Loading conversations...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list">
        <div className="conversation-list__empty">
          <p>No conversations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div
          key={conversation.conversationId}
          className={`conversation-item ${
            activeConversationId === conversation.conversationId ? 'conversation-item--active' : ''
          }`}
          onClick={() => onSelectConversation(conversation.conversationId)}
        >
          <div className="conversation-item__avatar">
            <Avatar
              avatar={conversation.otherUser.avatar}
              name={conversation.otherUser.name}
              size="medium"
            />
          </div>
          <div className="conversation-item__content">
            <div className="conversation-item__header">
              <h4 className="conversation-item__name">{conversation.otherUser.name}</h4>
              <span className="conversation-item__time">{formatTime(conversation.lastMessageAt)}</span>
            </div>
            <div className="conversation-item__message">
              <p className="conversation-item__preview">{truncateMessage(conversation.lastMessage)}</p>
              {conversation.unreadMessageCount > 0 && (
                <span className="conversation-item__unread">{conversation.unreadMessageCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
