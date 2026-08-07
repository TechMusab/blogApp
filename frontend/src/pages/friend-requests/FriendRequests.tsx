import './FriendRequests.scss';

import { memo, useState, useEffect } from 'react';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { FriendsService, type FriendRequest } from '../../services/FriendsService';
import { Avatar } from '../../shared/components/Avatar';
import type { RootState } from '../../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/toasts/toastsSlice';

export const FriendRequestsPage = memo(function FriendRequestsPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
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
      console.error('Failed to fetch friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleAccept = async (requestId: number) => {
    try {
      await FriendsService.acceptFriendRequest(requestId, token);
      dispatch(addToast({ message: 'Friend request accepted', type: 'success' }));
      fetchRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
      dispatch(addToast({ message: 'Failed to accept request', type: 'error' }));
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await FriendsService.rejectFriendRequest(requestId, token);
      dispatch(addToast({ message: 'Friend request rejected', type: 'success' }));
      fetchRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      dispatch(addToast({ message: 'Failed to reject request', type: 'error' }));
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await FriendsService.cancelFriendRequest(requestId, token);
      dispatch(addToast({ message: 'Friend request cancelled', type: 'success' }));
      fetchRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      dispatch(addToast({ message: 'Failed to cancel request', type: 'error' }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="friend-requests">
      <DashboardNavbar />
      <main className="friend-requests__content">
        <div className="friend-requests__header">
          <h1 className="friend-requests__title">Friend Requests</h1>
          <p className="friend-requests__subtitle">Manage your friend connections</p>
        </div>

        {loading ? (
          <div className="friend-requests__loading">Loading...</div>
        ) : (
          <div className="friend-requests__sections">
            <section className="friend-requests__section">
              <h2 className="friend-requests__section-title">
                Incoming ({incomingRequests.length})
              </h2>
              {incomingRequests.length === 0 ? (
                <div className="friend-requests__empty">
                  <p>No incoming requests.</p>
                </div>
              ) : (
                <div className="friend-requests__list">
                  {incomingRequests.map((request) => (
                    <div key={request.id} className="friend-requests__item">
                      <div className="friend-requests__user">
                        <Avatar
                          avatar={request.senderAvatar}
                          name={request.senderName}
                          size="medium"
                        />
                        <div className="friend-requests__user-info">
                          <h3 className="friend-requests__user-name">{request.senderName}</h3>
                          <p className="friend-requests__user-email">{request.senderEmail}</p>
                          <p className="friend-requests__user-date">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                      <div className="friend-requests__actions">
                        <button
                          className="friend-requests__button friend-requests__button--accept"
                          onClick={() => handleAccept(request.id)}
                        >
                          Accept
                        </button>
                        <button
                          className="friend-requests__button friend-requests__button--reject"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="friend-requests__section">
              <h2 className="friend-requests__section-title">
                Outgoing ({outgoingRequests.length})
              </h2>
              {outgoingRequests.length === 0 ? (
                <div className="friend-requests__empty">
                  <p>No outgoing requests.</p>
                </div>
              ) : (
                <div className="friend-requests__list">
                  {outgoingRequests.map((request) => (
                    <div key={request.id} className="friend-requests__item">
                      <div className="friend-requests__user">
                        <Avatar
                          avatar={request.receiverAvatar}
                          name={request.receiverName}
                          size="medium"
                        />
                        <div className="friend-requests__user-info">
                          <h3 className="friend-requests__user-name">{request.receiverName}</h3>
                          <p className="friend-requests__user-email">{request.receiverEmail}</p>
                          <p className="friend-requests__user-date">Pending • {formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                      <div className="friend-requests__actions">
                        <button
                          className="friend-requests__button friend-requests__button--cancel"
                          onClick={() => handleCancel(request.id)}
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
});
