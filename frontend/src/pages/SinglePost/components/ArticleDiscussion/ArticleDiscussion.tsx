import './ArticleDiscussion.scss';

import { memo, useState } from 'react';
import { Edit, Trash2, X, Check } from 'lucide-react';
import type { Comment } from '../../../../types';
import { BookmarkButton } from '../../../../shared/components/BookmarkButton';
import { Avatar } from '../../../../shared/components/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import { PostsService } from '../../../../services/PostsService';
import { addToast } from '../../../../redux/slices/toasts/toastsSlice';
import type { RootState } from '../../../../redux/store';

type ArticleDiscussionProps = {
  likes: number;
  hasLiked: boolean;
  totalComments: number;
  commentsList: Comment[];
  userAvatar: string;
  commentText: string;
  onLike: () => void;
  onCommentChange: (value: string) => void;
  onSendComment: (event: React.FormEvent) => void;
  postId: string;
  onCommentUpdate?: (commentId: string, updatedComment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
};

export const ArticleDiscussion = memo(function ArticleDiscussion({
  likes,
  hasLiked,
  totalComments,
  commentsList,
  userAvatar,
  commentText,
  onLike,
  onCommentChange,
  onSendComment,
  postId,
  onCommentUpdate,
  onCommentDelete,
}: ArticleDiscussionProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSaveEdit = async () => {
    if (!token || !editingCommentId) return;
    try {
      const updatedComment = await PostsService.updateComment(postId, editingCommentId, { text: editText }, token);
      if (onCommentUpdate) {
        onCommentUpdate(editingCommentId, updatedComment);
      }
      dispatch(addToast({ message: 'Comment updated successfully', type: 'success' }));
      setEditingCommentId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
      dispatch(addToast({ message: 'Failed to update comment', type: 'error' }));
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setShowDeleteConfirm(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!token || !showDeleteConfirm) return;
    try {
      await PostsService.deleteComment(postId, showDeleteConfirm, token);
      if (onCommentDelete) {
        onCommentDelete(showDeleteConfirm);
      }
      dispatch(addToast({ message: 'Comment deleted successfully', type: 'success' }));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      dispatch(addToast({ message: 'Failed to delete comment', type: 'error' }));
    }
  };

  const isCommentOwner = (comment: Comment) => {
    return user && comment.userId === user.id;
  };

  return (
    <div className="article__interaction">
      <hr className="article__interaction-divider" />

      <div className="article__stats-row">
        <button
          type="button"
          className="article__stat-btn article__stat-btn--like"
          onClick={onLike}
          style={{ color: hasLiked ? '#FF6B6B' : 'var(--text-secondary)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>

          <span>
            {likes} {likes === 1 ? 'Like' : 'Likes'}
          </span>
        </button>
        <BookmarkButton postId={postId} className="article__bookmark" />

        <div className="article__stat-btn article__stat-btn--comment">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{totalComments} comments</span>
        </div>
      </div>

      <h2 className="article__discussion-title">Discussion</h2>

      {totalComments === 0 ? (
        <div className="article__empty-state">No comments yet. Be the first to respond.</div>
      ) : (
        <div className="article__comments-list">
          {commentsList.map((comment) => (
            <div key={comment.id} className="article__comment-item">
              <div className="article__comment-avatar">
                <Avatar avatar={comment.avatar} name={comment.author} size="small" />
              </div>
              <div className="article__comment-content">
                <div className="article__comment-meta">
                  <span className="article__comment-author">{comment.author}</span>
                  <span className="article__comment-date">{comment.date}</span>
                  {isCommentOwner(comment) && (
                    <div className="article__comment-actions">
                      <button
                        type="button"
                        className="article__comment-action-btn"
                        onClick={() => handleEditComment(comment)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="article__comment-action-btn article__comment-action-btn--danger"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="article__comment-edit">
                    <textarea
                      className="article__comment-edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="article__comment-edit-actions">
                      <button
                        type="button"
                        className="article__comment-edit-btn article__comment-edit-btn--cancel"
                        onClick={handleCancelEdit}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="article__comment-edit-btn article__comment-edit-btn--save"
                        onClick={handleSaveEdit}
                      >
                        <Check size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="article__comment-text">{comment.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="article__comment-box">
        <div className="article__comment-avatar">
          <Avatar avatar={userAvatar} name="You" size="small" />
        </div>
        <div className="article__comment-input-container">
          <textarea
            className="article__comment-textarea"
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendComment(e);
              }
            }}
          />
          <button
            type="button"
            className="article__comment-send-btn"
            onClick={onSendComment}
            aria-label="Send comment"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="article__confirm-dialog">
          <div className="article__confirm-content">
            <h3>Delete Comment</h3>
            <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="article__confirm-actions">
              <button
                type="button"
                className="article__confirm-cancel"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="article__confirm-delete"
                onClick={confirmDeleteComment}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
