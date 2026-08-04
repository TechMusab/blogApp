import './Dashboard.scss';

import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Flame } from 'lucide-react';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { SearchInput } from './components/Search';
import { FilterChip } from './components/FilterChip';
import { DashboardGreeting } from './components/DashboardGreeting';
import { PostCard } from './components/PostCard';
import { Tabs } from './components/Tabs';
import type { RootState } from '../../redux/store';
import {
  selectCategories,
  selectFilteredPosts,
  selectSearchResults,
  selectPaginationState,
} from '../../redux/selectors/postsSelectors';
import { setActiveCategory, setActiveTab, setSearchQuery } from '../../redux/slices/ui/uiSlice';
import { setPagedPosts } from '../../redux/slices/posts/postsSlice';
import { PostsService } from '../../services/PostsService';

export const DashboardPage = memo(function DashboardPage() {
  const posts = useSelector(selectFilteredPosts);
  const searchResults = useSelector(selectSearchResults);
  const categories = useSelector(selectCategories);
  const pagination = useSelector(selectPaginationState);
  const { activeTab, activeCategory, searchQuery } = useSelector((state: RootState) => state.ui);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const hasFetchedPosts = useRef(false);
  const displayedPosts = useMemo(
    () => (activeTab === 'popular' ? [...posts].sort((a, b) => b.likes - a.likes) : posts),
    [posts, activeTab]
  );
  const changeQuery = useCallback((query: string) => dispatch(setSearchQuery(query)), [dispatch]);
  const selectPost = useCallback(
    (post: { id: string }) => navigate(`/posts/${post.id}`),
    [navigate]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      PostsService.getPosts(newPage, 10, token || undefined)
        .then((pagedResult) => {
          dispatch(setPagedPosts(pagedResult));
        })
        .catch(() => {
          dispatch(
            setPagedPosts({
              items: [],
              totalCount: 0,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 0,
              hasPrevious: false,
              hasNext: false,
            })
          );
        });
    },
    [dispatch, token, currentPage]
  );

  useEffect(() => {
    setCurrentPage(pagination.pageNumber);
  }, [pagination.pageNumber]);

  // Refresh posts when navigating back to dashboard
  useEffect(() => {
    // Only fetch posts if we're actually on the dashboard page and haven't fetched yet
    if (token && location.pathname === '/dashboard' && !hasFetchedPosts.current) {
      hasFetchedPosts.current = true;
      
      PostsService.getPosts(1, 10, token)
        .then((pagedResult) => {
          dispatch(setPagedPosts(pagedResult));
        })
        .catch(() => {
          dispatch(
            setPagedPosts({
              items: [],
              totalCount: 0,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 0,
              hasPrevious: false,
              hasNext: false,
            })
          );
        });
    }
  }, [location.pathname, token, dispatch]);

  // Reset fetch flag when navigating away from dashboard
  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      hasFetchedPosts.current = false;
    }
  }, [location.pathname]);

  return (
    <div className="dashboard">
      <DashboardNavbar />
      <main className="dashboard__content">
        <DashboardGreeting
          userName={user?.name?.split(' ')[0] || 'Mara'}
          postCount={pagination.totalCount}
          onNewPost={() => navigate('/create')}
        />
        <div className="dashboard__divider" />
        <section className="dashboard__discovery" aria-label="Find posts">
          <SearchInput
            query={searchQuery}
            results={searchResults}
            onQueryChange={changeQuery}
            onSelect={selectPost}
          />
          <div className="filter-chips" aria-label="Filter posts by category">
            {categories.map(({ name, count }) => (
              <FilterChip
                key={name}
                label={name}
                count={count}
                active={activeCategory === name}
                onClick={() => dispatch(setActiveCategory(name))}
              />
            ))}
          </div>
        </section>
        <section className="dashboard__filter-section">
          <Tabs
            tabs={[
              { id: 'latest', label: 'Latest', icon: <Calendar size={16} /> },
              { id: 'popular', label: 'Popular', icon: <Flame size={16} /> },
            ]}
            activeTab={activeTab}
            onChange={(value) => dispatch(setActiveTab(value as 'latest' | 'popular'))}
          />
        </section>
        <div className="dashboard__grid">
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {pagination.totalPages > 1 && (
          <div className="dashboard__pagination">
            <button
              className="pagination__button"
              disabled={!pagination.hasPrevious}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={16} />
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
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
});
