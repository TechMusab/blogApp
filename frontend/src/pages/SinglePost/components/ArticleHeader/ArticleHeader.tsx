import './ArticleHeader.scss'

import { memo } from 'react'
import type { Post } from '../../../../types'

type ArticleHeaderProps = {
  post: Post
  onBack: () => void
}

export const ArticleHeader = memo(function ArticleHeader({ post, onBack }: ArticleHeaderProps) {
  return (
    <>
      <button type="button" className="article__back" onClick={onBack}>
        ← Back to feed
      </button>
      <br />

      <span className="article__category">{post.category}</span>

      <h1 className="article__title">{post.title}</h1>

      <div className="article__author">
        <div className="article__avatar">{post.avatar}</div>
        <div className="article__author-info">
          <span className="article__author-name">{post.author}</span>
          <span className="article__meta">{post.date}</span>
        </div>
      </div>

      <hr className="article__divider" />
    </>
  )
})

