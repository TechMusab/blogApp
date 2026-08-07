import './PostCard.scss';

import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Post } from '../../../../types';
import { BookmarkButton } from '../../../../shared/components/BookmarkButton';
import { Avatar } from '../../../../shared/components/Avatar';
import { EditPostModal } from '../../../../shared/components/EditPostModal/EditPostModal';
import { useDispatch, useSelector } from 'react-redux';
import { removePost } from '../../../../redux/slices/posts/postsSlice';
import { addToast } from '../../../../redux/slices/toasts/toastsSlice';
import { PostsService } from '../../../../services/PostsService';
import type { RootState } from '../../../../redux/store';

export const PostCard = memo(function PostCard({ post }: { post: Post }) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = user && post.authorId === user.id;

  const handleEdit = () => {
    setMenuOpen(false);
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!token) return;
    try {
      await PostsService.deletePost(post.id, token);
      dispatch(removePost(post.id));
      dispatch(addToast({ message: 'Post deleted successfully', type: 'success' }));
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
      dispatch(addToast({ message: 'Failed to delete post', type: 'error' }));
    }
  };

  return (
    <article className="post-card">
      <BookmarkButton postId={post.id} className="post-card__bookmark" />
      {isOwner && (
        <div className="post-card__menu">
          <button
            type="button"
            className="post-card__menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="post-card__dropdown">
              <button type="button" className="post-card__dropdown-item" onClick={handleEdit}>
                <Edit size={14} />
                Edit
              </button>
              <button type="button" className="post-card__dropdown-item post-card__dropdown-item--danger" onClick={handleDelete}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      <Link to={`/posts/${post.id}`} className="post-card__link">
        <div className="post-card__image-container">
          <img className="post-card__image" src={post.coverImage} alt={post.title} />
          <div className="post-card__badges">
            <span className="post-card__badge">{post.category}</span>
          </div>
        </div>

        <div className="post-card__body">
          <div className="post-card__author">
            <div className="post-card__avatar">
              <Avatar avatar={post.avatar} name={post.author} size="small" />
            </div>
            <div className="post-card__author-info">
              <span className="post-card__author-name">{post.author}</span>
              <span className="post-card__author-date">{post.date}</span>
            </div>
          </div>

          <h3 className="post-card__title">{post.title}</h3>
          <p className="post-card__excerpt">{post.excerpt}</p>

          <div className="post-card__footer">
            <span className="post-card__comments">
              <span className="post-card__icon">💬</span>
              {post.comments}
            </span>
            <span className="post-card__likes">
              <span className="post-card__icon">❤️</span>
              {post.likes}
            </span>
          </div>
        </div>
      </Link>
      <EditPostModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} post={post} />
      {showDeleteConfirm && (
        <div className="post-card__confirm-dialog">
          <div className="post-card__confirm-content">
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="post-card__confirm-actions">
              <button type="button" className="post-card__confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="post-card__confirm-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});
