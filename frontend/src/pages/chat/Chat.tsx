import './Chat.scss';

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { Avatar } from '../../shared/components/Avatar';
import { MessageInput } from './components/MessageInput/index';
import { MessageList } from './components/MessageList/index';
import { ConversationList } from './components/ConversationList/index';
import { ChatService } from '../../services/ChatService';
import { signalRService } from '../../services/SignalRService';
import type { RootState } from '../../redux/store';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import {
  fetchConversations,
  setActiveConversation,
  addMessage,
  updateMessage,
  markConversationAsRead,
  addTypingUser,
  removeTypingUser,
  updateConversationLastMessage,
  incrementUnreadCount,
} from '../../redux/slices/chat/chatSlice';
import { Send, ArrowLeft, MoreVertical, Wifi, WifiOff } from 'lucide-react';

export const ChatPage = memo(function ChatPage() {
  const dispatch = useDispatch();
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers);
  const isLoading = useSelector((state: RootState) => state.chat.isLoading);
  
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('disconnected');
  const hasInitializedSignalR = useRef(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize SignalR connection
  useEffect(() => {
    if (!token || hasInitializedSignalR.current) return;

    const initSignalR = async () => {
      setIsConnecting(true);
      setConnectionState('connecting');
      try {
        await signalRService.startConnection(token);
        hasInitializedSignalR.current = true;
        setConnectionState('connected');
        setupSignalRHandlers();
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
        setConnectionState('disconnected');
        dispatch(addToast({ message: 'Failed to connect to chat service', type: 'error' }));
      } finally {
        setIsConnecting(false);
      }
    };

    initSignalR();

    return () => {
      // Cleanup SignalR on unmount
      signalRService.removeAllEventHandlers();
      setConnectionState('disconnected');
    };
  }, [token]);

  // Setup SignalR event handlers
  const setupSignalRHandlers = useCallback(() => {
    signalRService.onReceiveMessage((message) => {
      const conversationId = activeConversationId || 0;
      
      // Add message to current conversation if it's the active one
      if (activeConversationId) {
        dispatch(addMessage({ conversationId: activeConversationId, message }));
      }
      
      // Update conversation last message
      dispatch(updateConversationLastMessage({
        conversationId: message.senderId === Number(user?.id) ? conversationId : message.senderId,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      }));
      
      // Increment unread count if message is from another user and conversation is not active
      if (message.senderId !== Number(user?.id) && message.senderId !== activeConversationId) {
        dispatch(incrementUnreadCount(message.senderId));
      }
    });

    signalRService.onMessageRead((conversationId: number) => {
      if (conversationId === activeConversationId) {
        dispatch(markConversationAsRead(conversationId));
      }
    });

    signalRService.onUserTyping((conversationId: number, userId: number) => {
      if (conversationId === activeConversationId && userId !== Number(user?.id)) {
        dispatch(addTypingUser(userId));
      }
    });

    signalRService.onUserStoppedTyping((conversationId: number, userId: number) => {
      if (conversationId === activeConversationId) {
        dispatch(removeTypingUser(userId));
      }
    });

    signalRService.onMessageDeleted((messageId: number) => {
      if (activeConversationId) {
        dispatch(updateMessage({
          conversationId: activeConversationId,
          messageId,
          updates: { isDeleted: true },
        }));
      }
    });

    signalRService.onReconnecting(() => {
      setConnectionState('reconnecting');
      dispatch(addToast({ message: 'Reconnecting to chat...', type: 'info' }));
    });

    signalRService.onReconnected(() => {
      setConnectionState('connected');
      dispatch(addToast({ message: 'Reconnected to chat', type: 'success' }));
    });

    signalRService.onClose(() => {
      setConnectionState('disconnected');
      hasInitializedSignalR.current = false;
    });
  }, [activeConversationId, user?.id, dispatch]);

  // Refresh SignalR handlers when active conversation changes
  useEffect(() => {
    if (hasInitializedSignalR.current) {
      setupSignalRHandlers();
    }
  }, [activeConversationId, setupSignalRHandlers]);

  // Fetch conversations on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchConversations() as any);
    }
  }, [token, dispatch]);

  // Handle direct navigation to chat with userId
  useEffect(() => {
    if (paramUserId && token) {
      handleStartConversation(parseInt(paramUserId, 10));
    }
  }, [paramUserId, token]);

  // Join/leave SignalR conversation when active conversation changes
  useEffect(() => {
    if (!hasInitializedSignalR.current) return;

    const currentSignalRConversation = signalRService.getCurrentConversationId();

    if (activeConversationId && activeConversationId !== currentSignalRConversation) {
      signalRService.joinConversation(activeConversationId).catch(err => {
        console.error('Failed to join conversation:', err);
      });
    } else if (!activeConversationId && currentSignalRConversation) {
      signalRService.leaveConversation(currentSignalRConversation).catch(err => {
        console.error('Failed to leave conversation:', err);
      });
    }

    return () => {
      // Leave conversation when component unmounts or conversation changes
      if (activeConversationId) {
        signalRService.leaveConversation(activeConversationId).catch(err => {
          console.error('Failed to leave conversation on cleanup:', err);
        });
      }
    };
  }, [activeConversationId]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (activeConversationId && !messages[activeConversationId]) {
      ChatService.getMessages(activeConversationId, 1, 30, token).then(response => {
        dispatch({
          type: 'chat/fetchMessages/fulfilled',
          payload: response,
          meta: { arg: { conversationId: activeConversationId } },
        });
      }).catch(err => {
        console.error('Failed to fetch messages:', err);
      });
    }
  }, [activeConversationId, messages, token, dispatch]);

  // Auto-mark as read when conversation is open
  useEffect(() => {
    if (activeConversationId && signalRService.isConnected()) {
      signalRService.markAsRead(activeConversationId);
      dispatch(markConversationAsRead(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  const handleStartConversation = async (targetUserId: number) => {
    if (!token) {
      return;
    }
    
    try {
      const conversation = await ChatService.createConversation(targetUserId, token);
      
      // Add the conversation to Redux state
      dispatch({
        type: 'chat/createConversation/fulfilled',
        payload: conversation
      });
      
      dispatch(setActiveConversation(conversation.conversationId));
      if (isMobileView) {
        setShowConversationList(false);
      }
    } catch (error) {
      dispatch(addToast({ message: 'Failed to start conversation', type: 'error' }));
    }
  };

  const handleSelectConversation = useCallback((conversationId: number) => {
    dispatch(setActiveConversation(conversationId));
    if (isMobileView) {
      setShowConversationList(false);
    }
  }, [dispatch, isMobileView]);

  const handleBackToList = () => {
    setShowConversationList(true);
    dispatch(setActiveConversation(null));
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId || !token) return;

    try {
      if (signalRService.isConnected()) {
        await signalRService.sendMessage(activeConversationId, content);
      } else {
        // Fallback to REST API if SignalR is not connected
        const message = await ChatService.sendMessage(activeConversationId, content, token);
        dispatch(addMessage({ conversationId: activeConversationId, message }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      dispatch(addToast({ message: 'Failed to send message. Please try again.', type: 'error' }));
      throw error; // Re-throw to let MessageInput handle loading state
    }
  };

  const handleTypingStart = async () => {
    if (activeConversationId && signalRService.isConnected()) {
      await signalRService.typingStart(activeConversationId);
    }
  };

  const handleTypingStop = async () => {
    if (activeConversationId && signalRService.isConnected()) {
      await signalRService.typingStop(activeConversationId);
    }
  };

  const handleMarkAsRead = async () => {
    if (activeConversationId && signalRService.isConnected()) {
      await signalRService.markAsRead(activeConversationId);
    }
  };

  const activeConversation = conversations.find(c => c.conversationId === activeConversationId);
  const conversationMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const isTyping = typingUsers.length > 0;
  const typingUserName = activeConversation?.otherUser.name;

  return (
    <div className="chat">
      <DashboardNavbar />
      <main className="chat__content">
        <div className="chat__container">
          {/* Conversation List */}
          <div className={`chat__sidebar ${isMobileView && !showConversationList ? 'chat__sidebar--hidden' : ''}`}>
            <div className="chat__sidebar-header">
              <h2 className="chat__sidebar-title">Messages</h2>
            </div>
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoading || isConnecting}
            />
          </div>

          {/* Chat Window */}
          <div className={`chat__main ${isMobileView && showConversationList ? 'chat__main--hidden' : ''}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="chat__header">
                  {isMobileView && (
                    <button className="chat__back-button" onClick={handleBackToList}>
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="chat__header-user">
                    <Avatar avatar={activeConversation.otherUser.avatar} name={activeConversation.otherUser.name} size="medium" />
                    <div className="chat__header-info">
                      <h3 className="chat__header-name">{activeConversation.otherUser.name}</h3>
                      {isTyping && typingUserName && (
                        <span className="chat__header-status">{typingUserName} is typing...</span>
                      )}
                    </div>
                  </div>
                  <div className="chat__header-right">
                    <div className={`chat__connection-status chat__connection-status--${connectionState}`}>
                      {connectionState === 'connected' && <Wifi size={16} />}
                      {(connectionState === 'disconnected' || connectionState === 'reconnecting') && <WifiOff size={16} />}
                      {connectionState === 'reconnecting' && <span className="chat__connection-text">Reconnecting...</span>}
                    </div>
                    <button className="chat__header-menu">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat__messages">
                  <MessageList
                    messages={conversationMessages}
                    currentUserId={Number(user?.id) || 0}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </div>

                {/* Message Input */}
                <div className="chat__input-area">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onTypingStart={handleTypingStart}
                    onTypingStop={handleTypingStop}
                  />
                </div>
              </>
            ) : (
              <div className="chat__empty">
                <div className="chat__empty-content">
                  <Send size={48} className="chat__empty-icon" />
                  <h3 className="chat__empty-title">Select a conversation</h3>
                  <p className="chat__empty-text">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});
