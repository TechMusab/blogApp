import './PeopleModal.scss';

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, X } from 'lucide-react';
import { UserCard } from '../../../pages/people/components/UserCard';
import { FriendsService, type FriendRequest } from '../../../services/FriendsService';
import type { RootState } from '../../../redux/store';
import { addToast } from '../../../redux/slices/toasts/toastsSlice';
import type { UserProfile } from '../../../types';

type PeopleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TabType = 'discover' | 'friends' | 'requests';

export const PeopleModal = memo(function PeopleModal({ isOpen, onClose }: PeopleModalProps) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [search, setSearch] = useState('');
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscoverUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await FriendsService.getAllUsers(search, 'all', token);
      setDiscoverUsers(data);
    } catch (error) {
      console.error('Failed to fetch discover users:', error);
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  const fetchFriends = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await FriendsService.getFriends(token);
      setFriends(data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [incoming, outgoing] = await Promise.all([
        FriendsService.getIncomingRequests(token),
        FriendsService.getOutgoingRequests(token),
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (activeTab === 'discover') {
      fetchDiscoverUsers();
    } else if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [isOpen, activeTab, fetchDiscoverUsers, fetchFriends, fetchRequests]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getRequestId = (userId: number): number | null => {
    const incoming = incomingRequests.find(r => r.senderId === userId);
    if (incoming) return incoming.id;
    
    const outgoing = outgoingRequests.find(r => r.receiverId === userId);
    if (outgoing) return outgoing.id;
    
    return null;
  };

  const handleFriendAction = async (userId: number, action: string) => {
    try {
      const requestId = getRequestId(userId);
      
      if (action === 'send') {
        await FriendsService.sendFriendRequest(userId, token);
        dispatch(addToast({ message: 'Friend request sent!', type: 'success' }));
      } else if (action === 'accept' && requestId) {
        await FriendsService.acceptFriendRequest(requestId, token);
        dispatch(addToast({ message: 'Friend request accepted!', type: 'success' }));
      } else if (action === 'reject' && requestId) {
        await FriendsService.rejectFriendRequest(requestId, token);
        dispatch(addToast({ message: 'Friend request rejected.', type: 'info' }));
      } else if (action === 'cancel' && requestId) {
        await FriendsService.cancelFriendRequest(requestId, token);
        dispatch(addToast({ message: 'Friend request cancelled.', type: 'info' }));
      } else if (action === 'remove') {
        await FriendsService.removeFriend(userId, token);
        dispatch(addToast({ message: 'Friend removed.', type: 'info' }));
      }
      
      // Refresh current tab data
      if (activeTab === 'discover') {
        fetchDiscoverUsers();
      } else if (activeTab === 'friends') {
        fetchFriends();
      } else if (activeTab === 'requests') {
        fetchRequests();
      }
    } catch (error) {
      console.error('[PeopleModal] Friend action failed:', error);
      dispatch(addToast({ message: 'Action failed. Please try again.', type: 'error' }));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearch('');
  };

  const getCurrentUsers = (): UserProfile[] => {
    if (activeTab === 'discover') return discoverUsers;
    if (activeTab === 'friends') return friends;
    if (activeTab === 'requests') {
      return incomingRequests.map(req => ({
        id: req.senderId,
        name: req.senderName,
        email: req.senderEmail,
        avatar: req.senderAvatar,
        createdAt: req.createdAt,
        postsCount: 0,
        friendsCount: 0,
        friendStatus: req.status,
        friendRequestDirection: 'received',
      })) as UserProfile[];
    }
    return [];
  };

  if (!isOpen) return null;

  return (
    <div className="people-modal-overlay" onClick={onClose}>
      <div ref={modalRef} className="people-modal" onClick={(e) => e.stopPropagation()}>
        <div className="people-modal__header">
          <div className="people-modal__title">
            <Users size={20} style={{ color: '#f59e0b' }} />
            <h2>People</h2>
          </div>
          <button className="people-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="people-modal__tabs">
          <button
            className={`people-modal__tab ${activeTab === 'discover' ? 'people-modal__tab--active' : ''}`}
            onClick={() => handleTabChange('discover')}
          >
            Discover
          </button>
          <button
            className={`people-modal__tab ${activeTab === 'friends' ? 'people-modal__tab--active' : ''}`}
            onClick={() => handleTabChange('friends')}
          >
            Friends
          </button>
          <button
            className={`people-modal__tab ${activeTab === 'requests' ? 'people-modal__tab--active' : ''}`}
            onClick={() => handleTabChange('requests')}
          >
            Requests
          </button>
        </div>

        <div className="people-modal__search">
          <input
            type="text"
            className="people-modal__search-input"
            placeholder="Search people..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="people-modal__content">
          {loading ? (
            <div className="people-modal__loading">Loading...</div>
          ) : getCurrentUsers().length === 0 ? (
            <div className="people-modal__empty">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="people-modal__grid">
              {getCurrentUsers().map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onFriendAction={handleFriendAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
