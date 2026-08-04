import './SinglePost.scss';

import { memo, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { ArticleHeader } from './components/ArticleHeader';
import { ArticleContent } from './components/ArticleContent';
import { ArticleDiscussion } from './components/ArticleDiscussion';
import type { RootState } from '../../redux/store';
import { toggleLike, addComment, updatePost } from '../../redux/slices/posts/postsSlice';
import { PostsService } from '../../services/PostsService';
import { FriendsService } from '../../services/FriendsService';

export const SinglePostPage = memo(function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const post = useSelector((state: RootState) =>
    state.posts?.posts?.find((entry) => entry.id === id)
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const hasLiked = !!user && (post?.likedBy ?? []).includes(user.id);
  const [commentText, setCommentText] = useState('');
  const hasFetchedPost = useRef(false);

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
        console.error('Error fetching post:', error);
      });
    }
  }, [id, token, dispatch]);

  if (!post) {
    return (
      <div className="article-page">
        <DashboardNavbar />
        <div className="article__container">
          <p className="article__not-found">Post not found.</p>
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
      setCommentText('');
    } catch {
      // Keep the typed comment so the user can retry.
    }
  };

  const handleFriendAction = async (action: string) => {
    if (!user || !token || !post.authorId) return;

    try {
      const authorId = parseInt(post.authorId);
      
      switch (action) {
        case 'send':
          await FriendsService.sendFriendRequest(authorId, token);
          break;
        case 'accept':
          // Need to get the request ID first
          const incomingRequests = await FriendsService.getIncomingRequests(token);
          const request = incomingRequests.find(r => r.senderId === authorId);
          if (request) {
            await FriendsService.acceptFriendRequest(request.id, token);
          }
          break;
        case 'reject':
          const incomingReqs = await FriendsService.getIncomingRequests(token);
          const rejectReq = incomingReqs.find(r => r.senderId === authorId);
          if (rejectReq) {
            await FriendsService.rejectFriendRequest(rejectReq.id, token);
          }
          break;
        case 'cancel':
          const outgoingRequests = await FriendsService.getOutgoingRequests(token);
          const cancelReq = outgoingRequests.find(r => r.receiverId === authorId);
          if (cancelReq) {
            await FriendsService.cancelFriendRequest(cancelReq.id, token);
          }
          break;
        case 'remove':
          await FriendsService.removeFriend(authorId, token);
          break;
      }
      
      // Refresh post to get updated friend status
      const updatedPost = await PostsService.getPost(post.id, token);
      dispatch(updatePost(updatedPost));
      
    } catch {
      // Friend action failed
    }
  };

  // Don't show friend button if viewing own post
  const showFriendButton = user && post.authorId !== user.id;

  return (
    <div className="article-page">
      <DashboardNavbar />

      <article className="article">
        <div className="article__container">
          <ArticleHeader 
            post={post} 
            onBack={() => navigate('/dashboard')} 
            onFriendAction={showFriendButton ? handleFriendAction : undefined}
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
          />
        </div>
      </article>
    </div>
  );
});
