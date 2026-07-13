import { memo } from 'react'
import type { Comment } from '../../../types'
import BookmarkButton from '../../../shared/components/BookmarkButton'

type ArticleDiscussionProps = {
  likes: number
  hasLiked: boolean
  totalComments: number
  commentsList: Comment[]
  userAvatar: string
  commentText: string
  onLike: () => void
  onCommentChange: (value: string) => void
  onSendComment: (event: React.FormEvent) => void
  postId: string
}

const ArticleDiscussion = memo(function ArticleDiscussion({
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
}: ArticleDiscussionProps) {
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>

          <span>
            {likes} {likes === 1 ? 'Like' : 'Likes'}
          </span>
        </button>
        <BookmarkButton postId={postId} className="article__bookmark" />

        <div className="article__stat-btn article__stat-btn--comment">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="article__comment-avatar">{comment.avatar}</div>
              <div className="article__comment-content">
                <div className="article__comment-meta">
                  <span className="article__comment-author">{comment.author}</span>
                  <span className="article__comment-date">{comment.date}</span>
                </div>
                <p className="article__comment-text">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="article__comment-box">
        <div className="article__comment-avatar">{userAvatar}</div>
        <div className="article__comment-input-container">
          <textarea
            className="article__comment-textarea"
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSendComment(e)
              }
            }}
          />
          <button type="button" className="article__comment-send-btn" onClick={onSendComment} aria-label="Send comment">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

export default ArticleDiscussion
