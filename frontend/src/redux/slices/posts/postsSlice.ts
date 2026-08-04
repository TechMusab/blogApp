import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Post, Comment, PagedResult } from '../../../types';

interface PostsState {
  posts: Post[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

const initialState: PostsState = {
  posts: [],
  pagination: {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  },
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (_, action: PayloadAction<Post[]>) => ({
      posts: action.payload,
      pagination: initialState.pagination,
    }),

    setPagedPosts: (state, action: PayloadAction<PagedResult<Post>>) => {
      // Merge with existing posts to preserve friend status
      const mergedPosts = action.payload.items.map(newPost => {
        const existingPost = state.posts.find(p => p.id === newPost.id);
        
        if (existingPost) {
          // Preserve friend status from existing post if it has more detailed data
          if (existingPost.authorFriendStatus !== null && existingPost.authorFriendStatus !== undefined) {
            return {
              ...newPost,
              authorFriendStatus: existingPost.authorFriendStatus,
              authorFriendRequestDirection: existingPost.authorFriendRequestDirection
            };
          } else {
            return newPost;
          }
        }
        
        return newPost;
      });
      
      state.posts = mergedPosts;
      state.pagination = {
        totalCount: action.payload.totalCount,
        pageNumber: action.payload.pageNumber,
        pageSize: action.payload.pageSize,
        totalPages: action.payload.totalPages,
        hasPrevious: action.payload.hasPrevious,
        hasNext: action.payload.hasNext,
      };
    },

    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },

    toggleLike: (
      state,
      action: PayloadAction<{
        postId: string;
        userId: string;
      }>
    ) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find((p) => p.id === postId);

      if (!post) return;

      const index = post.likedBy.indexOf(userId);

      if (index >= 0) {
        post.likedBy.splice(index, 1);
        post.likes--;
      } else {
        post.likedBy.push(userId);
        post.likes++;
      }
    },

    addComment: (
      state,
      action: PayloadAction<{
        postId: string;
        comment: Comment;
      }>
    ) => {
      const post = state.posts.find((p) => p.id === action.payload.postId);

      if (post) {
        post.commentsList.push(action.payload.comment);
        post.comments += 1;
      }
    },

    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index >= 0) {
        state.posts[index] = action.payload;
      } else {
        state.posts.push(action.payload);
      }
    },
  },
});

export const { setPosts, setPagedPosts, addPost, toggleLike, addComment, updatePost } = postsSlice.actions;
export default postsSlice.reducer;
