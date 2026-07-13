import { memo } from 'react'
import type { Post } from '../../types'

type SearchItemProps = {
  post: Post
  isActive: boolean
  onSelect: (post: Post) => void
}

const SearchItem = memo(function SearchItem({ post, isActive, onSelect }: SearchItemProps) {
  return (
    <button
      type="button"
      className={`search-item${isActive ? ' search-item--active' : ''}`}
      role="option"
      aria-selected={isActive}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(post)}
    >
      <span className="search-item__icon" aria-hidden="true">▧</span>
      <span className="search-item__copy">
        <span className="search-item__title">{post.title}</span>
        <span className="search-item__author">{post.author}</span>
      </span>
      <span className="search-item__badge">POST</span>
    </button>
  )
})

export default SearchItem
