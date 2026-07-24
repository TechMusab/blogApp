import './Dashboard.scss'

import { memo, useCallback, useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DashboardNavbar } from '../../shared/components/DashboardNavbar'
import { SearchInput } from './components/Search'
import { FilterChip } from './components/FilterChip'
import { DashboardGreeting } from './components/DashboardGreeting'
import { PostCard } from './components/PostCard'
import { Tabs } from './components/Tabs'
import type { RootState } from '../../redux/store'
import { selectCategories, selectFilteredPosts, selectSearchResults, selectPagination } from '../../redux/selectors/postsSelectors'
import { setActiveCategory, setActiveTab, setSearchQuery } from '../../redux/slices/ui/uiSlice'
import { setPagedPosts } from '../../redux/slices/posts/postsSlice'
import { PostsService } from '../../services/PostsService'

export const DashboardPage = memo(function DashboardPage() {
  const posts = useSelector(selectFilteredPosts)
  const searchResults = useSelector(selectSearchResults)
  const categories = useSelector(selectCategories)
  const pagination = useSelector(selectPagination)
  const { activeTab, activeCategory, searchQuery } = useSelector((state: RootState) => state.ui)
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const displayedPosts = useMemo(() => activeTab === 'popular' ? [...posts].sort((a, b) => b.likes - a.likes) : posts, [posts, activeTab])
  const changeQuery = useCallback((query: string) => dispatch(setSearchQuery(query)), [dispatch])
  const selectPost = useCallback((post: { id: string }) => navigate(`/posts/${post.id}`), [navigate])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    PostsService.getPosts(newPage, 10)
      .then((pagedResult) => dispatch(setPagedPosts(pagedResult)))
      .catch(() => dispatch(setPagedPosts({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPrevious: false, hasNext: false })))
  }, [dispatch])

  useEffect(() => {
    setCurrentPage(pagination.pageNumber)
  }, [pagination.pageNumber])

  return <div className="dashboard">
    <DashboardNavbar />
    <main className="dashboard__content">
      <DashboardGreeting userName={user?.name?.split(' ')[0] || 'Mara'} postCount={pagination.totalCount} onNewPost={() => navigate('/create')} />
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
      {pagination.totalPages > 1 && (
        <div className="dashboard__pagination">
          <button 
            className="pagination__button" 
            disabled={!pagination.hasPrevious}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="pagination__info">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button 
            className="pagination__button" 
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </main>
  </div>
})

