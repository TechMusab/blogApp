import './ArticleHeader.scss';

import { memo } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import type { Post } from '../../../../types';
import { Avatar } from '../../../../shared/components/Avatar';
import { FriendRequestStatusValues } from '../../../../types';

type ArticleHeaderProps = {
  post: Post;
  onBack: () => void;
  onFriendAction?: (action: string) => void;
};

export const ArticleHeader = memo(function ArticleHeader({ post, onBack, onFriendAction }: ArticleHeaderProps) {
  const getFriendButton = () => {
    if (!onFriendAction) {
      return null;
    }

    if (post.authorFriendStatus === FriendRequestStatusValues.Accepted) {
      return (
        <button
          className="article__friend-button article__friend-button--danger"
          onClick={() => onFriendAction('remove')}
        >
          <UserMinus size={16} />
          Remove Friend
        </button>
      );
    }

    if (post.authorFriendStatus === FriendRequestStatusValues.Pending) {
      if (post.authorFriendRequestDirection === 'received') {
        return (
          <div className="article__friend-button-group">
            <button
              className="article__friend-button article__friend-button--primary"
              onClick={() => onFriendAction('accept')}
            >
              Accept
            </button>
            <button
              className="article__friend-button article__friend-button--secondary"
              onClick={() => onFriendAction('reject')}
            >
              Reject
            </button>
          </div>
        );
      }
      return (
        <button
          className="article__friend-button article__friend-button--secondary"
          onClick={() => onFriendAction('cancel')}
        >
          Cancel Request
        </button>
      );
    }

    return (
      <button
        className="article__friend-button article__friend-button--primary"
        onClick={() => onFriendAction('send')}
      >
        <UserPlus size={16} />
        Add Friend
      </button>
    );
  };

  return (
    <>
      <button type="button" className="article__back" onClick={onBack}>
        ← Back to feed
      </button>
      <br />

      <span className="article__category">{post.category}</span>

      <h1 className="article__title">{post.title}</h1>

      <div className="article__author">
        <div className="article__avatar">
          <Avatar avatar={post.avatar} name={post.author} size="medium" />
        </div>
        <div className="article__author-info">
          <span className="article__author-name">{post.author}</span>
          <span className="article__meta">{post.date}</span>
        </div>
        {getFriendButton()}
      </div>

      <hr className="article__divider" />
    </>
  );
});
