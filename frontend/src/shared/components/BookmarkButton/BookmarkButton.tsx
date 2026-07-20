import './BookmarkButton.scss'

import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSaved } from '../../../redux/slices/savedPosts/savedPostsSlice'
import { selectIsSaved } from '../../../redux/selectors/savedPostsSelectors'
import type { RootState } from '../../../redux/store'
import { PostsService } from '../../../services/PostsService'

type BookmarkButtonProps = { postId: string; className?: string }
export const BookmarkButton = memo(function BookmarkButton({ postId, className = '' }: BookmarkButtonProps) {
  const dispatch = useDispatch()
  const isSaved = useSelector((state: RootState) => selectIsSaved(postId)(state))
  const token = useSelector((state: RootState) => state.auth.token)
  const handleClick = useCallback(async () => {
    if (!token) return

    try {
      await PostsService.toggleSaved(postId, token)
      dispatch(toggleSaved(postId))
    } catch {
      // Keep UI state unchanged when the backend rejects the update.
    }
  }, [dispatch, postId, token])
  return <button type="button" className={`bookmark-button${isSaved ? ' bookmark-button--saved' : ''} ${className}`.trim()} onClick={handleClick} aria-label={isSaved ? 'Remove bookmark' : 'Bookmark post'} aria-pressed={isSaved}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75v17.12a.75.75 0 0 1-1.2.6L12 17.88l-4.8 3.59a.75.75 0 0 1-1.2-.6V3.75Z" /></svg>
  </button>
})
