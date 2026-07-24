import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

const selectPosts = (state: RootState) => state.posts?.posts ?? []
const selectQuery = (state: RootState) => state.ui.searchQuery
const selectCategory = (state: RootState) => state.ui.activeCategory
const selectPaginationState = (state: RootState) => state.posts?.pagination ?? { totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPrevious: false, hasNext: false }

const normalize = (value: string) => value.trim().toLocaleLowerCase()

const postMatchesQuery = (post: RootState['posts']['posts'][number], query: string) => {
  if (!query) return true
  return [post.title, post.author, post.category, ...(post.tags ?? [])]
    .some((value) => normalize(value).includes(query))
}

export const selectSearchResults = createSelector(
  [selectPosts, selectQuery],
  (posts, query) => {
    const normalizedQuery = normalize(query)
    return normalizedQuery ? posts.filter((post) => postMatchesQuery(post, normalizedQuery)) : []
  },
)

export const selectFilteredPosts = createSelector(
  [selectPosts, selectCategory],
  (posts, category) => {
    return posts.filter(
      (post) => category === 'All' || post.category === category
    )
  },
)

export const selectCategories = createSelector([selectPosts], (posts) => {
  const counts = new Map<string, number>()
  posts.forEach((post) => counts.set(post.category, (counts.get(post.category) ?? 0) + 1))
  const preferredOrder = ['Science', 'Photography', 'Urbanism', 'Technology', 'Travel', 'Culture', 'Design', 'Essays']
  const categories = [...counts.keys()].sort((a, b) => {
    const left = preferredOrder.indexOf(a)
    const right = preferredOrder.indexOf(b)
    return (left === -1 ? Number.MAX_SAFE_INTEGER : left) - (right === -1 ? Number.MAX_SAFE_INTEGER : right) || a.localeCompare(b)
  })
  return [{ name: 'All', count: posts.length }, ...categories.map((name) => ({ name, count: counts.get(name) ?? 0 }))]
})

export const selectPagination = createSelector([selectPaginationState], (pagination) => pagination)
