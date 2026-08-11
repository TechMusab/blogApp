import './MessageBubble.scss';

import { memo } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { MessageDto } from '../../../../types';

type MessageBubbleProps = {
  message: MessageDto;
  isOwn: boolean;
};

export const MessageBubble = memo(function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (message.isDeleted) {
    return (
      <div className={`message-bubble message-bubble--${isOwn ? 'own' : 'other'}`}>
        <div className="message-bubble__deleted">
          <p>This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-bubble message-bubble--${isOwn ? 'own' : 'other'}`}>
      <div className="message-bubble__content">
        <p className="message-bubble__text">{message.content}</p>
        <div className="message-bubble__footer">
          <span className="message-bubble__time">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <div className="message-bubble__status">
              {message.readAt ? (
                <CheckCheck size={14} className="message-bubble__status-icon message-bubble__status-icon--read" />
              ) : (
                <Check size={14} className="message-bubble__status-icon" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
