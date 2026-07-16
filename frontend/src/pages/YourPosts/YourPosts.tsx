import '../SavedPosts/SavedPosts.scss'

import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashboardNavbar from '../../shared/components/DashboardNavbar'
import PostCard from '../dashboard/components/PostCard'
import type { RootState } from '../../redux/store'

const EmptyYourPostsState = memo(function EmptyYourPostsState() {
  const navigate = useNavigate()
  return <section className="saved-posts__empty">
    <svg className="saved-posts__empty-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.75A1.75 1.75 0 0 1 6.75 3h10.5A1.75 1.75 0 0 1 19 4.75v14.5A1.75 1.75 0 0 1 17.25 21H6.75A1.75 1.75 0 0 1 5 19.25V4.75Z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
    <h2>No posts yet</h2><p>Start writing and your published posts will appear here.</p>
    <button type="button" onClick={() => navigate('/create')}>Write a Post</button>
  </section>
})

const YourPostsPage = memo(function YourPostsPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const posts = useSelector((state: RootState) => state.posts.filter((post) => post.authorId === user?.id))

  return <div className="dashboard saved-posts"><DashboardNavbar /><main className="dashboard__content">
    <header className="saved-posts__header"><span>YOUR LIBRARY</span><h1>Your Posts</h1><p>Posts you've published from this account.</p></header>
    <div className="dashboard__divider" />
    {posts.length ? <div className="dashboard__grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <EmptyYourPostsState />}
  </main></div>
})

export default YourPostsPage
