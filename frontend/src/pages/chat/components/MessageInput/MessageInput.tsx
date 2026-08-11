import './MessageInput.scss';

import { memo, useState, useCallback, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

type MessageInputProps = {
  onSendMessage: (content: string) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
};

export const MessageInput = memo(function MessageInput({ onSendMessage, onTypingStart, onTypingStop }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.length > 0) {
      onTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop();
      }, 2000);
    } else {
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    
    if (!trimmed || isSending) return;
    
    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setMessage('');
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, onSendMessage, onTypingStop]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleBlur = () => {
    onTypingStop();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        className="message-input__field"
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={1}
        disabled={isSending}
      />
      <button 
        type="submit" 
        className="message-input__send" 
        disabled={!message.trim() || isSending}
      >
        {isSending ? (
          <Loader2 size={18} className="message-input__spinner" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
});
