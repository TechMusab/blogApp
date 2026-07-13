import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

const selectPosts = (state: RootState) => state.posts
const selectSavedIds = (state: RootState) => state.savedPosts.savedPostIds
export const selectSavedPosts = createSelector([selectPosts, selectSavedIds], (posts, ids) => posts.filter((post) => ids.includes(post.id)))
export const selectIsSaved = (postId: string) => createSelector([selectSavedIds], (ids) => ids.includes(postId))
