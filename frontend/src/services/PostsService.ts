import type { Comment, Post, PagedResult } from '../types'
import { request } from '../utils/api'

type CreatePostRequest = {
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  category: string
  tags?: string[]
  featured?: boolean
  quote?: string
  paragraphs?: string[]
}

type AddCommentRequest = {
  text: string
}

type ToggleResponse = {
  active: boolean
}

export const PostsService = {
  getPosts: (pageNumber = 1, pageSize = 10) => 
    request<PagedResult<Post>>(`/posts?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  createPost: (body: CreatePostRequest, token: string) =>
    request<Post>('/posts', { method: 'POST', body: JSON.stringify(body) }, token),
  toggleLike: (postId: string, token: string) =>
    request<ToggleResponse>(`/posts/${postId}/like`, { method: 'POST' }, token),
  addComment: (postId: string, body: AddCommentRequest, token: string) =>
    request<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }, token),
  getSavedPostIds: (token: string) => request<string[]>('/posts/saved', {}, token),
  toggleSaved: (postId: string, token: string) =>
    request<ToggleResponse>(`/posts/${postId}/save`, { method: 'POST' }, token),
  clearSaved: (token: string) => request<void>('/posts/saved', { method: 'DELETE' }, token),
}
