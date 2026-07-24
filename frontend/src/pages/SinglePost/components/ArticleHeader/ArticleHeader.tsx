import './ArticleHeader.scss'

import { memo } from 'react'
import type { Post } from '../../../../types'

type ArticleHeaderProps = {
  post: Post
  onBack: () => void
}

export const ArticleHeader = memo(function ArticleHeader({ post, onBack }: ArticleHeaderProps) {
  const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5191'
  
  const renderAvatar = () => {
    if (post.avatar && (post.avatar.startsWith('http') || post.avatar.startsWith('/'))) {
      const fullUrl = post.avatar.startsWith('http') ? post.avatar : `${BACKEND_BASE_URL}${post.avatar}`
      return <div className="article__avatar"><img src={fullUrl} alt={post.author} /></div>
    }
    return <div className="article__avatar">{post.avatar}</div>
  }

  return (
    <>
      <button type="button" className="article__back" onClick={onBack}>
        ← Back to feed
      </button>
      <br />

      <span className="article__category">{post.category}</span>

      <h1 className="article__title">{post.title}</h1>

      <div className="article__author">
        {renderAvatar()}
        <div className="article__author-info">
          <span className="article__author-name">{post.author}</span>
          <span className="article__meta">{post.date}</span>
        </div>
      </div>

      <hr className="article__divider" />
    </>
  )
})

