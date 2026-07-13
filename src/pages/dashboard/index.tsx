import { memo, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../shared/components/DashboardNavbar'
import SearchInput from '../../components/Search/SearchInput'
import FilterChip from '../../components/FilterChip/FilterChip'
import DashboardGreeting from './components/DashboardGreeting'
import PostCard from './components/PostCard'
import Tabs from './components/Tabs'
import type { RootState } from '../../redux/store'
import { selectCategories, selectFilteredPosts, selectSearchResults } from '../../redux/selectors/postsSelectors'
import { setActiveCategory, setActiveTab, setSearchQuery } from '../../redux/slices/ui/uiSlice'

const DashboardPage = memo(function DashboardPage() {
  const posts = useSelector(selectFilteredPosts)
  const searchResults = useSelector(selectSearchResults)
  const categories = useSelector(selectCategories)
  const { activeTab, activeCategory, searchQuery } = useSelector((state: RootState) => state.ui)
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const displayedPosts = useMemo(() => activeTab === 'popular' ? [...posts].sort((a, b) => b.likes - a.likes) : posts, [posts, activeTab])
  const changeQuery = useCallback((query: string) => dispatch(setSearchQuery(query)), [dispatch])
  const selectPost = useCallback((post: { id: string }) => navigate(`/posts/${post.id}`), [navigate])

  return <div className="dashboard">
    <DashboardNavbar />
    <main className="dashboard__content">
      <DashboardGreeting userName={user?.name?.split(' ')[0] || 'Mara'} postCount={displayedPosts.length} onNewPost={() => navigate('/create')} />
      <div className="dashboard__divider" />
      <section className="dashboard__discovery" aria-label="Find posts">
        <SearchInput query={searchQuery} results={searchResults} onQueryChange={changeQuery} onSelect={selectPost} />
        <div className="filter-chips" aria-label="Filter posts by category">
          {categories.map(({ name, count }) => <FilterChip key={name} label={name} count={count} active={activeCategory === name} onClick={() => dispatch(setActiveCategory(name))} />)}
        </div>
      </section>
      <section className="dashboard__filter-section">
        <Tabs tabs={[{ id: 'latest', label: 'Latest' }, { id: 'popular', label: 'Popular' }]} activeTab={activeTab} onChange={(value) => dispatch(setActiveTab(value as 'latest' | 'popular'))} />
      </section>
      <div className="dashboard__grid">{displayedPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
    </main>
  </div>
})

export default DashboardPage
