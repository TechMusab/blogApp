import type { Comment, Post, PagedResult } from '../types';
import { request } from '../utils/api';

type CreatePostRequest = {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  quote?: string;
  paragraphs?: string[];
};

type AddCommentRequest = {
  text: string;
};

type UpdateCommentRequest = {
  text: string;
};

type UpdatePostRequest = {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  quote?: string;
  paragraphs?: string[];
  visibility?: number;
};

type ToggleResponse = {
  active: boolean;
};

export const PostsService = {
  getPosts: (pageNumber = 1, pageSize = 10, token?: string) =>
    request<PagedResult<Post>>(`/posts?pageNumber=${pageNumber}&pageSize=${pageSize}`, {}, token),
  getPost: (postId: string, token?: string) => {
    return request<Post>(`/posts/${postId}`, {}, token);
  },
  searchPosts: (query: string, token?: string) =>
    request<Post[]>(`/posts/search?q=${encodeURIComponent(query)}`, {}, token),
  createPost: (body: CreatePostRequest, token: string) =>
    request<Post>('/posts', { method: 'POST', body: JSON.stringify(body) }, token),
  updatePost: (postId: string, body: UpdatePostRequest, token: string) =>
    request<Post>(`/posts/${postId}`, { method: 'PATCH', body: JSON.stringify(body) }, token),
  deletePost: (postId: string, token: string) =>
    request<void>(`/posts/${postId}`, { method: 'DELETE' }, token),
  toggleLike: (postId: string, token: string) =>
    request<ToggleResponse>(`/posts/${postId}/like`, { method: 'POST' }, token),
  addComment: (postId: string, body: AddCommentRequest, token: string) =>
    request<Comment>(
      `/posts/${postId}/comments`,
      { method: 'POST', body: JSON.stringify(body) },
      token
    ),
  updateComment: (postId: string, commentId: string, body: UpdateCommentRequest, token: string) =>
    request<Comment>(
      `/posts/${postId}/comments/${commentId}`,
      { method: 'PATCH', body: JSON.stringify(body) },
      token
    ),
  deleteComment: (postId: string, commentId: string, token: string) =>
    request<void>(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }, token),
  getSavedPostIds: (token: string) => request<string[]>('/posts/saved', {}, token),
  toggleSaved: (postId: string, token: string) =>
    request<ToggleResponse>(`/posts/${postId}/save`, { method: 'POST' }, token),
  clearSaved: (token: string) => request<void>('/posts/saved', { method: 'DELETE' }, token),
};
