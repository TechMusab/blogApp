import './SavedPosts.scss'

import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DashboardNavbar } from '../../shared/components/DashboardNavbar'
import { PostCard } from '../dashboard/components/PostCard'
import { selectSavedPosts } from '../../redux/selectors/savedPostsSelectors'

const EmptySavedState = memo(function EmptySavedState() {
  const navigate = useNavigate()
  return <section className="saved-posts__empty">
    <svg className="saved-posts__empty-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75v17.12a.75.75 0 0 1-1.2.6L12 17.88l-4.8 3.59a.75.75 0 0 1-1.2-.6V3.75Z" /></svg>
    <h2>No saved posts yet</h2><p>Bookmark posts to read them later.</p>
    <button type="button" onClick={() => navigate('/dashboard')}>Browse Posts</button>
  </section>
})

export const SavedPostsPage = memo(function SavedPostsPage() {
  const navigate = useNavigate()
  const posts = useSelector(selectSavedPosts)
  return <div className="dashboard saved-posts"><DashboardNavbar /><main className="dashboard__content">
    <header className="saved-posts__header">
      <button type="button" className="article__back" onClick={() => navigate('/dashboard')}>
        ← Back to feed
      </button>
      <h1>Saved Posts</h1>
      <p>Posts you've bookmarked for later.</p>
    </header>
    <div className="dashboard__divider" />
    {posts.length ? <div className="dashboard__grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <EmptySavedState />}
  </main></div>
})
