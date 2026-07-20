import './ArticleContent.scss'

import { memo } from 'react'
import type { Post } from '../../../../types'

type ArticleContentProps = {
  post: Post
  paragraphs: string[]
}

export const ArticleContent = memo(function ArticleContent({ post, paragraphs }: ArticleContentProps) {
  return (
    <>
      <img className="article__image" src={post.coverImage} alt={post.title} />

      {post.quote && (
        <blockquote className="article__quote">{post.quote}</blockquote>
      )}

      <div className="article__content">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="article__paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </>
  )
})

