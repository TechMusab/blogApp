import './Friends.scss';

import { memo, useState, useEffect } from 'react';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { FriendsService } from '../../services/FriendsService';
import { Avatar } from '../../shared/components/Avatar';
import type { RootState } from '../../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import type { UserProfile } from '../../types';

export const FriendsPage = memo(function FriendsPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
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
  };

  useEffect(() => {
    fetchFriends();
  }, [token]);

  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      await FriendsService.removeFriend(friendId, token);
      dispatch(addToast({ message: 'Friend removed successfully.', type: 'info' }));
      fetchFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
      dispatch(addToast({ message: 'Failed to remove friend.', type: 'error' }));
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="friends">
      <DashboardNavbar />
      <main className="friends__content">
        <div className="friends__header">
          <h1 className="friends__title">Friends</h1>
          <p className="friends__subtitle">Your connections</p>
        </div>

        <div className="friends__search">
          <input
            type="text"
            className="friends__search-input"
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="friends__loading">Loading...</div>
        ) : filteredFriends.length === 0 ? (
          <div className="friends__empty">
            <p>{search ? 'No friends match your search.' : 'You have no friends yet.'}</p>
          </div>
        ) : (
          <div className="friends__grid">
            {filteredFriends.map((friend) => (
              <article key={friend.id} className="friends__card">
                <div className="friends__card-avatar">
                  <Avatar avatar={friend.avatar} name={friend.name} size="large" />
                </div>

                <div className="friends__card-info">
                  <h3 className="friends__card-name">{friend.name}</h3>
                  <p className="friends__card-email">{friend.email}</p>
                  <p className="friends__card-joined">Joined {formatDate(friend.createdAt)}</p>

                  <div className="friends__card-stats">
                    <span className="friends__card-stat">
                      <strong>{friend.postsCount}</strong> posts
                    </span>
                  </div>
                </div>

                <div className="friends__card-actions">
                  <button
                    className="friends__card-button friends__card-button--message"
                    disabled
                  >
                    Message
                  </button>
                  <button
                    className="friends__card-button friends__card-button--remove"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Remove Friend
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
});
