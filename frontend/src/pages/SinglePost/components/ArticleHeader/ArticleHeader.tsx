import './ArticleHeader.scss';

import { memo } from 'react';
import { UserPlus, UserMinus, Share, Bookmark, Globe, Users, Lock, Trash2, Edit } from 'lucide-react';
import type { Post } from '../../../../types';
import { Avatar } from '../../../../shared/components/Avatar';
import { FriendRequestStatusValues, BlogVisibilityValues } from '../../../../types';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import type { RootState } from '../../../../redux/store';
import { addToast } from '../../../../redux/slices/toasts/toastsSlice';

type ArticleHeaderProps = {
  post: Post;
  onBack: () => void;
  onFriendAction?: (action: string) => void;
  onShare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
};

export const ArticleHeader = memo(function ArticleHeader({ post, onBack, onFriendAction, onShare, onSave, isSaved, onDelete, onEdit }: ArticleHeaderProps) {
  const dispatch = useDispatch();
  const isOwner = useSelector((state: RootState) => state.auth.user && post.authorId === state.auth.user.id);

  const handleShare = () => {
    if (onShare) {
      onShare();
      dispatch(addToast({ message: 'Link copied to clipboard', type: 'success' }));
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      const message = isSaved ? 'Blog removed from saved blogs' : 'Blog saved successfully';
      dispatch(addToast({ message, type: 'success' }));
    }
  };

  const getVisibilityBadge = () => {
    const visibilityConfig = {
      [BlogVisibilityValues.Public]: { icon: Globe, label: 'PUBLIC' },
      [BlogVisibilityValues.FriendsOnly]: { icon: Users, label: 'FRIENDS ONLY' },
      [BlogVisibilityValues.Private]: { icon: Lock, label: 'PRIVATE' },
    };
    const config = visibilityConfig[post.visibility] || visibilityConfig[BlogVisibilityValues.Public];
    const Icon = config.icon;
    return (
      <span className="article__visibility-badge">
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getFriendButton = () => {
    if (!onFriendAction) {
      return null;
    }

    if (post.authorFriendStatus === FriendRequestStatusValues.Accepted) {
      return (
        <button
          className="article__friend-button article__friend-button--gold"
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
              className="article__friend-button article__friend-button--gold"
              onClick={() => onFriendAction('accept')}
            >
              Accept
            </button>
            <button
              className="article__friend-button article__friend-button--gold-secondary"
              onClick={() => onFriendAction('reject')}
            >
              Reject
            </button>
          </div>
        );
      }
      return (
        <button
          className="article__friend-button article__friend-button--gold-secondary"
          onClick={() => onFriendAction('cancel')}
        >
          Cancel Request
        </button>
      );
    }

    return (
      <button
        className="article__friend-button article__friend-button--gold"
        onClick={() => onFriendAction('send')}
      >
        <UserPlus size={16} />
        Add Friend
      </button>
    );
  };

  return (
    <>
      <div className="article__header-top">
        <button type="button" className="article__back" onClick={onBack}>
          ← Back to feed
        </button>
        <div className="article__actions">
          <button type="button" className="article__action-btn" onClick={handleShare}>
            <Share size={16} />
            Share
          </button>
          <button type="button" className="article__action-btn" onClick={handleSave}>
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
            Save
          </button>
        </div>
      </div>

      <div className="article__badges">
        <span className="article__category">{post.category}</span>
        {getVisibilityBadge()}
      </div>

      <h1 className="article__title">{post.title}</h1>

      <div className="article__author">
        <div className="article__author-left">
          <div className="article__avatar">
            <Avatar avatar={post.avatar} name={post.author} size="medium" />
          </div>
          <div className="article__author-info">
            <span className="article__author-name">{post.author}</span>
            <span className="article__meta">{post.date}</span>
          </div>
        </div>
        <div className="article__author-right">
          {getFriendButton()}
          {isOwner && (
            <>
              {onEdit && (
                <button
                  type="button"
                  className="article__edit-btn"
                  onClick={onEdit}
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="article__delete-btn"
                  onClick={onDelete}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <hr className="article__divider" />
    </>
  );
});
