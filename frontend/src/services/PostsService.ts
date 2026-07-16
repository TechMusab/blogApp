import type { Comment, Post } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5191/api'

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

type ApiError = {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

async function request<TResponse>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<TResponse> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError
    const validationMessages = data.errors ? Object.values(data.errors).flat() : []
    return data.message ?? validationMessages[0] ?? data.title ?? 'Request failed.'
  } catch {
    return 'Request failed.'
  }
}

export const PostsService = {
  getPosts: () => request<Post[]>('/posts'),
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
