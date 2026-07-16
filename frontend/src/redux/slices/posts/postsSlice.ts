import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Post, Comment } from '../../../types'

const initialState: Post[] = []

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (_, action: PayloadAction<Post[]>) => action.payload,

    addPost: (state, action: PayloadAction<Post>) => {
      state.unshift(action.payload)
    },

    toggleLike: (
      state,
      action: PayloadAction<{
        postId: string
        userId: string
      }>,
    ) => {
      const { postId, userId } = action.payload
      const post = state.find((p) => p.id === postId)

      if (!post) return

      const index = post.likedBy.indexOf(userId)

      if (index >= 0) {
        post.likedBy.splice(index, 1)
        post.likes--
      } else {
        post.likedBy.push(userId)
        post.likes++
      }
    },

    addComment: (
      state,
      action: PayloadAction<{
        postId: string
        comment: Comment
      }>,
    ) => {
      const post = state.find((p) => p.id === action.payload.postId)

      if (post) {
        post.commentsList.push(action.payload.comment)
        post.comments += 1
      }
    },
  },
})

export const { setPosts, addPost, toggleLike, addComment } = postsSlice.actions
export default postsSlice.reducer
