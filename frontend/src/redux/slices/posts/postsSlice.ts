import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Post, Comment, PagedResult } from '../../../types'

interface PostsState {
  posts: Post[]
  pagination: {
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
}

const initialState: PostsState = {
  posts: [],
  pagination: {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false
  }
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (_, action: PayloadAction<Post[]>) => ({
      posts: action.payload,
      pagination: initialState.pagination
    }),

    setPagedPosts: (_, action: PayloadAction<PagedResult<Post>>) => ({
      posts: action.payload.items,
      pagination: {
        totalCount: action.payload.totalCount,
        pageNumber: action.payload.pageNumber,
        pageSize: action.payload.pageSize,
        totalPages: action.payload.totalPages,
        hasPrevious: action.payload.hasPrevious,
        hasNext: action.payload.hasNext
      }
    }),

    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload)
    },

    toggleLike: (
      state,
      action: PayloadAction<{
        postId: string
        userId: string
      }>,
    ) => {
      const { postId, userId } = action.payload
      const post = state.posts.find((p) => p.id === postId)

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
      const post = state.posts.find((p) => p.id === action.payload.postId)

      if (post) {
        post.commentsList.push(action.payload.comment)
        post.comments += 1
      }
    },
  },
})

export const { setPosts, setPagedPosts, addPost, toggleLike, addComment } = postsSlice.actions
export default postsSlice.reducer
