import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Post } from '../../../../types'
import SearchDropdown from './components/SearchDropdown'

type SearchInputProps = {
  query: string
  results: Post[]
  onQueryChange: (query: string) => void
  onSelect: (post: Post) => void
}

const SearchInput = memo(function SearchInput({ query, results, onQueryChange, onSelect }: SearchInputProps) {
  const [value, setValue] = useState(query)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setValue(query), [query])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const updateValue = useCallback((nextValue: string) => {
    setValue(nextValue)
    setOpen(nextValue.length > 0)
    setActiveIndex(-1)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onQueryChange(nextValue), 250)
  }, [onQueryChange])

  const select = useCallback((post: Post) => {
    setOpen(false)
    onSelect(post)
  }, [onSelect])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setOpen(false); return }
    if (!open || !results.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => (index + 1) % results.length) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1)) }
    if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); select(results[activeIndex]) }
  }, [activeIndex, open, results, select])

  return (
    <div className="search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <div className="search__field">
        <span className="search__icon" aria-hidden="true">⌕</span>
        <input value={value} onChange={(event) => updateValue(event.target.value)} onFocus={() => setOpen(value.length > 0)} onKeyDown={onKeyDown}
          placeholder="Search posts, authors, tags..." aria-label="Search posts, authors, or tags" aria-autocomplete="list" aria-expanded={open} />
        {value && <button type="button" className="search__clear" onClick={() => updateValue('')} aria-label="Clear search">×</button>}
      </div>
      {open && <SearchDropdown results={results} activeIndex={activeIndex} onSelect={select} />}
    </div>
  )
})

export default SearchInput
