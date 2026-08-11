import './UserCard.scss';

import { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Avatar } from '../../../../shared/components/Avatar';
import type { UserProfile } from '../../../../types';
import { FriendRequestStatusValues } from '../../../../types';

type UserCardProps = {
  user: UserProfile;
  onFriendAction: (userId: number, action: string) => void;
  onMessage?: (userId: number) => void;
  onRequestId?: (userId: number) => number | null;
};

export const UserCard = memo(function UserCard({ user, onFriendAction, onMessage }: UserCardProps) {
  const getFriendButton = () => {
    if (user.friendStatus === FriendRequestStatusValues.Accepted) {
      return (
        <div className="user-card__button-group">
          <button
            className="user-card__button user-card__button--secondary"
            onClick={() => {
              onMessage?.(user.id);
            }}
          >
            <MessageSquare size={16} />
            Message
          </button>
          <button
            className="user-card__button user-card__button--danger"
            onClick={() => {
              onFriendAction(user.id, 'remove');
            }}
          >
            Remove Friend
          </button>
        </div>
      );
    }

    if (user.friendStatus === FriendRequestStatusValues.Pending) {
      // If the request was received from this user, show Accept/Reject
      if (user.friendRequestDirection === 'received') {
        return (
          <div className="user-card__button-group">
            <button
              className="user-card__button user-card__button--primary"
              onClick={() => {
                onFriendAction(user.id, 'accept');
              }}
            >
              Accept
            </button>
            <button
              className="user-card__button user-card__button--secondary"
              onClick={() => {
                onFriendAction(user.id, 'reject');
              }}
            >
              Reject
            </button>
          </div>
        );
      }
      // If the request was sent by current user, show Cancel
      return (
        <button
          className="user-card__button user-card__button--secondary"
          onClick={() => {
            onFriendAction(user.id, 'cancel');
          }}
        >
          Cancel Request
        </button>
      );
    }

    return (
      <button
        className="user-card__button user-card__button--primary"
        onClick={() => {
          onFriendAction(user.id, 'send');
        }}
      >
        Add Friend
      </button>
    );
  };

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <article className="user-card">
      <div className="user-card__avatar">
        <Avatar avatar={user.avatar} name={user.name} size="large" />
      </div>

      <div className="user-card__info">
        <h3 className="user-card__name">{user.name}</h3>
        <p className="user-card__email">{user.email}</p>
        <p className="user-card__joined">Joined {joinedDate}</p>

        <div className="user-card__stats">
          <span className="user-card__stat">
            <strong>{user.postsCount}</strong> posts
          </span>
          <span className="user-card__stat">
            <strong>{user.friendsCount}</strong> friends
          </span>
        </div>
      </div>

      <div className="user-card__actions">{getFriendButton()}</div>
    </article>
  );
});
