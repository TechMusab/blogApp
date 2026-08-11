import './MessageList.scss';

import { memo, useEffect, useRef, useState } from 'react';
import { MessageBubble } from '../MessageBubble/index';
import type { MessageDto } from '../../../../types';

type MessageListProps = {
  messages: MessageDto[];
  currentUserId: number;
  onMarkAsRead: () => void;
};

export const MessageList = memo(function MessageList({ messages, currentUserId, onMarkAsRead }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track scroll position to determine if auto-scroll should be enabled
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAutoScrollEnabled(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only if enabled (user is near bottom)
  useEffect(() => {
    if (isAutoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAutoScrollEnabled]);

  // Enable auto-scroll when new messages arrive if already near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom) {
      setIsAutoScrollEnabled(true);
    }
  }, [messages.length]);

  useEffect(() => {
    // Only mark as read once when component mounts or messages load
    if (!hasMarkedAsRead.current && messages.length > 0) {
      const unreadMessages = messages.filter(m => m.senderId !== currentUserId && !m.readAt);
      if (unreadMessages.length > 0) {
        onMarkAsRead();
        hasMarkedAsRead.current = true;
      }
    }
  }, [messages, currentUserId, onMarkAsRead]);

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sortedMessages.length === 0) {
    return (
      <div className="message-list">
        <div className="message-list__empty">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list" ref={messagesContainerRef}>
      {sortedMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});
