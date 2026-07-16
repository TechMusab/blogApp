import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SavedPostsState = { savedPostIds: string[] }
const initialState: SavedPostsState = { savedPostIds: [] }

const savedPostsSlice = createSlice({
  name: 'savedPosts', initialState,
  reducers: {
    toggleSaved: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      state.savedPostIds = state.savedPostIds.includes(postId) ? state.savedPostIds.filter((id) => id !== postId) : [...state.savedPostIds, postId]
    },
    clearSaved: (state) => { state.savedPostIds = [] },
    restoreSaved: (state, action: PayloadAction<string[]>) => { state.savedPostIds = action.payload },
  },
})
export const { toggleSaved, clearSaved, restoreSaved } = savedPostsSlice.actions
export default savedPostsSlice.reducer
