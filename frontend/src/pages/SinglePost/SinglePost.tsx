import './SinglePost.scss';

import { memo, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { ArticleHeader } from './components/ArticleHeader';
import { ArticleContent } from './components/ArticleContent';
import { ArticleDiscussion } from './components/ArticleDiscussion';
import { EditPostModal } from '../../shared/components/EditPostModal/EditPostModal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog/ConfirmDialog';
import type { RootState } from '../../redux/store';
import { toggleLike, addComment, updatePost, removePost } from '../../redux/slices/posts/postsSlice';
import { toggleSaved } from '../../redux/slices/savedPosts/savedPostsSlice';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import { PostsService } from '../../services/PostsService';
import { FriendsService } from '../../services/FriendsService';
import type { Comment as CommentType } from '../../types';

export const SinglePostPage = memo(function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const post = useSelector((state: RootState) =>
    state.posts?.posts?.find((entry) => entry.id === id)
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const savedPostIds = useSelector((state: RootState) => state.savedPosts.savedPostIds);
  const hasLiked = !!user && (post?.likedBy ?? []).includes(user.id);
  const isSaved = !!post && savedPostIds.includes(post.id);
  const [commentText, setCommentText] = useState('');
  const hasFetchedPost = useRef(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset fetch flag when post ID changes
  useEffect(() => {
    hasFetchedPost.current = false;
  }, [id]);

  // Fetch post with friend status when component mounts
  useEffect(() => {
    if (id && token && !hasFetchedPost.current) {
      hasFetchedPost.current = true;
      
      PostsService.getPost(id, token).then((updatedPost) => {
        dispatch(updatePost(updatedPost));
      }).catch((error) => {
        console.error('Error fetching blog:', error);
      });
    }
  }, [id, token, dispatch]);

  if (!post) {
    return (
      <div className="article-page">
        <DashboardNavbar />
        <div className="article__container">
          <p className="article__not-found">Blog not found.</p>
        </div>
      </div>
    );
  }

  const paragraphs = post.paragraphs ?? [post.content];
  const commentsList = post.commentsList ?? [];
  const totalComments = post.comments;

  const handleLike = async () => {
    if (!user || !token) return;

    try {
      await PostsService.toggleLike(post.id, token);
      dispatch(toggleLike({ postId: post.id, userId: user.id }));
    } catch {
      // Keep UI state unchanged when the backend rejects the update.
    }
  };

  const handleSendComment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!commentText.trim() || !token) return;

    try {
      const newComment = await PostsService.addComment(
        post.id,
        { text: commentText.trim() },
        token
      );
      dispatch(addComment({ postId: post.id, comment: newComment }));
      dispatch(addToast({ message: 'Comment added successfully', type: 'success' }));
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      dispatch(addToast({ message: 'Failed to add comment', type: 'error' }));
    }
  };

  const handleFriendAction = async (action: string) => {
    if (!user || !token || !post.authorId) return;

    try {
      const authorId = parseInt(post.authorId);
      
      switch (action) {
        case 'send':
          await FriendsService.sendFriendRequest(authorId, token);
          dispatch(addToast({ message: 'Friend request sent', type: 'success' }));
          break;
        case 'accept':
          // Need to get the request ID first
          const incomingRequests = await FriendsService.getIncomingRequests(token);
          const request = incomingRequests.find(r => r.senderId === authorId);
          if (request) {
            await FriendsService.acceptFriendRequest(request.id, token);
            dispatch(addToast({ message: 'Friend request accepted', type: 'success' }));
          }
          break;
        case 'reject':
          const incomingReqs = await FriendsService.getIncomingRequests(token);
          const rejectReq = incomingReqs.find(r => r.senderId === authorId);
          if (rejectReq) {
            await FriendsService.rejectFriendRequest(rejectReq.id, token);
            dispatch(addToast({ message: 'Friend request rejected', type: 'success' }));
          }
          break;
        case 'cancel':
          const outgoingRequests = await FriendsService.getOutgoingRequests(token);
          const cancelReq = outgoingRequests.find(r => r.receiverId === authorId);
          if (cancelReq) {
            await FriendsService.cancelFriendRequest(cancelReq.id, token);
            dispatch(addToast({ message: 'Friend request cancelled', type: 'success' }));
          }
          break;
        case 'remove':
          await FriendsService.removeFriend(authorId, token);
          dispatch(addToast({ message: 'Friend removed successfully', type: 'success' }));
          break;
      }
      
      // Refresh post to get updated friend status
      const updatedPost = await PostsService.getPost(post.id, token);
      dispatch(updatePost(updatedPost));
      
    } catch (error) {
      console.error('Friend action failed:', error);
      dispatch(addToast({ message: 'Action failed. Please try again.', type: 'error' }));
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.content.substring(0, 150),
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href).catch(() => {
        // Clipboard access failed
      });
    }
  };

  const handleSave = () => {
    if (!user || !token || !post) return;
    dispatch(toggleSaved(post.id));
  };

  const handleCommentUpdate = (commentId: string, updatedComment: CommentType) => {
    // Update the comment in the post
    const updatedCommentsList = commentsList.map((c) =>
      c.id === commentId ? updatedComment : c
    );
    // Update the post with the new comment list
    const updatedPost = {
      ...post,
      commentsList: updatedCommentsList,
    };
    dispatch(updatePost(updatedPost));
  };

  const handleCommentDelete = (commentId: string) => {
    // Remove the comment from the post
    const updatedCommentsList = commentsList.filter((c) => c.id !== commentId);
    const updatedPost = {
      ...post,
      commentsList: updatedCommentsList,
      comments: updatedCommentsList.length,
    };
    dispatch(updatePost(updatedPost));
  };

  const handleEditPost = () => {
    setEditModalOpen(true);
  };

  const handleDeletePost = async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await PostsService.deletePost(post.id, token);
      dispatch(removePost(post.id));
      dispatch(addToast({ message: 'Blog deleted successfully', type: 'success' }));
      setShowDeleteConfirm(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      dispatch(addToast({ message: 'Failed to delete blog', type: 'error' }));
    } finally {
      setIsDeleting(false);
    }
  };

  // Don't show friend button if viewing own post
  const showFriendButton = user && post.authorId !== user.id;
  const isOwner = user && post.authorId === user.id;

  return (
    <div className="article-page">
      <DashboardNavbar />

      <article className="article">
        <div className="article__container">
          <ArticleHeader 
            post={post} 
            onBack={() => navigate('/dashboard')} 
            onFriendAction={showFriendButton ? handleFriendAction : undefined}
            onShare={handleShare}
            onSave={handleSave}
            isSaved={isSaved}
            onDelete={isOwner ? () => setShowDeleteConfirm(true) : undefined}
            onEdit={isOwner ? handleEditPost : undefined}
          />

          <ArticleContent post={post} paragraphs={paragraphs} />

          <ArticleDiscussion
            likes={post.likes}
            hasLiked={hasLiked}
            totalComments={totalComments}
            commentsList={commentsList}
            userAvatar={user?.avatar || 'MV'}
            commentText={commentText}
            onLike={handleLike}
            onCommentChange={setCommentText}
            onSendComment={handleSendComment}
            postId={post.id}
            onCommentUpdate={handleCommentUpdate}
            onCommentDelete={handleCommentDelete}
          />
        </div>
      </article>
      <EditPostModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} post={post}/>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
});
