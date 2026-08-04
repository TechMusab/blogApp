import './People.scss';

import { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { UserCard } from './components/UserCard';
import { FriendsService } from '../../services/FriendsService';
import type { RootState } from '../../redux/store';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import type { UserProfile } from '../../types';

export const PeoplePage = memo(function PeoplePage() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'friends' | 'not_friends' | 'pending'>('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      console.log('[PeoplePage] Fetching users with search:', search, 'filter:', filter);
      const data = await FriendsService.getAllUsers(search, filter);
      console.log('[PeoplePage] Received users:', data);
      console.log('[PeoplePage] Users count:', data.length);
      setUsers(data);
    } catch (error) {
      console.error('[PeoplePage] Failed to fetch users:', error);
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

  const handleFriendAction = async (userId: number, action: string) => {
    try {
      if (action === 'send') {
        await FriendsService.sendFriendRequest(userId);
        dispatch(addToast({ message: 'Friend request sent!', type: 'success' }));
      } else if (action === 'accept') {
        await FriendsService.acceptFriendRequest(userId);
        dispatch(addToast({ message: 'Friend request accepted!', type: 'success' }));
      } else if (action === 'reject') {
        await FriendsService.rejectFriendRequest(userId);
        dispatch(addToast({ message: 'Friend request rejected.', type: 'info' }));
      } else if (action === 'cancel') {
        await FriendsService.cancelFriendRequest(userId);
        dispatch(addToast({ message: 'Friend request cancelled.', type: 'info' }));
      } else if (action === 'remove') {
        await FriendsService.removeFriend(userId);
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
