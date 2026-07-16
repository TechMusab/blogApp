import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../../../../types'
import BookmarkButton from '../../../../shared/components/BookmarkButton'

const PostCard = memo(function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <BookmarkButton postId={post.id} className="post-card__bookmark" />
      <Link to={`/posts/${post.id}`} className="post-card__link">
      <div className="post-card__image-container">
        <img className="post-card__image" src={post.coverImage} alt={post.title} />
        <span className="post-card__badge">{post.category}</span>
      </div>

      <div className="post-card__body">
        <div className="post-card__author">
          <div className="post-card__avatar">{post.avatar}</div>
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
    </article>
  )
})

export default PostCard
