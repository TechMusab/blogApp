import './SearchDropdown.scss'

import { memo } from 'react'
import type { Post } from '../../../../../../types'
import { SearchItem } from '../SearchItem'

type SearchDropdownProps = {
  results: Post[]
  activeIndex: number
  onSelect: (post: Post) => void
}

export const SearchDropdown = memo(function SearchDropdown({ results, activeIndex, onSelect }: SearchDropdownProps) {
  return (
    <div className="search-dropdown" role="listbox" aria-label="Search results">
      {results.length ? results.map((post, index) => (
        <SearchItem key={post.id} post={post} isActive={index === activeIndex} onSelect={onSelect} />
      )) : <p className="search-dropdown__empty">No matching posts</p>}
    </div>
  )
})

