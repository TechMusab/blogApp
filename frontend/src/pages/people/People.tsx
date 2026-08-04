import './People.scss';

import { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { UserCard } from './components/UserCard';
import { FriendsService, type FriendRequest } from '../../services/FriendsService';
import type { RootState } from '../../redux/store';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import type { UserProfile } from '../../types';

export const PeoplePage = memo(function PeoplePage() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'friends' | 'not_friends' | 'pending'>('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [data, incoming, outgoing] = await Promise.all([
        FriendsService.getAllUsers(search, filter, token),
        FriendsService.getIncomingRequests(token),
        FriendsService.getOutgoingRequests(token),
      ]);
      setUsers(data);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, search, filter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (newFilter: 'all' | 'friends' | 'not_friends' | 'pending') => {
    setFilter(newFilter);
  };

  const getRequestId = (userId: number): number | null => {
    // Check incoming requests (received from this user)
    const incoming = incomingRequests.find(r => r.senderId === userId);
    if (incoming) return incoming.id;
    
    // Check outgoing requests (sent to this user)
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
      fetchUsers();
    } catch (error) {
      console.error('Friend action failed:', error);
      dispatch(addToast({ message: 'Action failed. Please try again.', type: 'error' }));
    }
  };

  return (
    <div className="people">
      <DashboardNavbar />
      <main className="people__content">
        <div className="people__header">
          <h1 className="people__title">Discover People</h1>
          <p className="people__subtitle">Find and connect with other writers</p>
        </div>

        <div className="people__controls">
          <div className="people__search">
            <input
              type="text"
              className="people__search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="people__filters">
            <button
              className={`people__filter ${filter === 'all' ? 'people__filter--active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`people__filter ${filter === 'friends' ? 'people__filter--active' : ''}`}
              onClick={() => handleFilterChange('friends')}
            >
              Friends
            </button>
            <button
              className={`people__filter ${filter === 'not_friends' ? 'people__filter--active' : ''}`}
              onClick={() => handleFilterChange('not_friends')}
            >
              Not Friends
            </button>
            <button
              className={`people__filter ${filter === 'pending' ? 'people__filter--active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending
            </button>
          </div>
        </div>

        {loading ? (
          <div className="people__loading">Loading...</div>
        ) : users.length === 0 ? (
          <div className="people__empty">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="people__grid">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onFriendAction={handleFriendAction}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
});
