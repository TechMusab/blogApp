import './SinglePost.scss'

import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardNavbar } from '../../shared/components/DashboardNavbar'
import { ArticleHeader } from './components/ArticleHeader'
import { ArticleContent } from './components/ArticleContent'
import { ArticleDiscussion } from './components/ArticleDiscussion'
import type { RootState } from '../../redux/store'
import { toggleLike, addComment } from '../../redux/slices/posts/postsSlice'
import { PostsService } from '../../services/PostsService'

export const SinglePostPage = memo(function SinglePostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const post = useSelector((state: RootState) => state.posts.find((entry) => entry.id === id))
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const hasLiked = !!user && (post?.likedBy ?? []).includes(user.id)
  const [commentText, setCommentText] = useState('')

  if (!post) {
    return (
      <div className="article-page">
        <DashboardNavbar />
        <div className="article__container">
          <p className="article__not-found">Post not found.</p>
        </div>
      </div>
    )
  }

  const paragraphs = post.paragraphs ?? [post.content]
  const commentsList = post.commentsList ?? []
  const totalComments = post.comments

  const handleLike = async () => {
    if (!user || !token) return

    try {
      await PostsService.toggleLike(post.id, token)
      dispatch(toggleLike({ postId: post.id, userId: user.id }))
    } catch {
      // Keep UI state unchanged when the backend rejects the update.
    }
  }

  const handleSendComment = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!commentText.trim() || !token) return

    try {
      const newComment = await PostsService.addComment(post.id, { text: commentText.trim() }, token)
      dispatch(addComment({ postId: post.id, comment: newComment }))
      setCommentText('')
    } catch {
      // Keep the typed comment so the user can retry.
    }
  }

  return (
    <div className="article-page">
      <DashboardNavbar />

      <article className="article">
        <div className="article__container">
          <ArticleHeader post={post} onBack={() => navigate('/dashboard')} />

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
  )
})

