import './UserCard.scss';

import { memo } from 'react';
import { Avatar } from '../../../../shared/components/Avatar';
import type { UserProfile, FriendRequestStatus } from '../../../../types';

type UserCardProps = {
  user: UserProfile;
  onFriendAction: (userId: number, action: string) => void;
};

export const UserCard = memo(function UserCard({ user, onFriendAction }: UserCardProps) {
  const getFriendButton = () => {
    if (user.friendStatus === FriendRequestStatus.Accepted) {
      return (
        <button
          className="user-card__button user-card__button--danger"
          onClick={() => onFriendAction(user.id, 'remove')}
        >
          Remove Friend
        </button>
      );
    }

    if (user.friendStatus === FriendRequestStatus.Pending) {
      return (
        <button
          className="user-card__button user-card__button--secondary"
          onClick={() => onFriendAction(user.id, 'cancel')}
        >
          Cancel Request
        </button>
      );
    }

    return (
      <button
        className="user-card__button user-card__button--primary"
        onClick={() => onFriendAction(user.id, 'send')}
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
