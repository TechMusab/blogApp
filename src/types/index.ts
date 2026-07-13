export type Post = {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags?: string[]
  author: string
  avatar: string
  date: string
  readTime: string
  likes: number
 likedBy: string[]
  comments: number
  featured: boolean
  quote?: string
  paragraphs?: string[]
  commentsList: Comment[]
}

export type User = {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
}
export type Comment = {
  id: string
  author: string
  avatar: string
  text: string
  date: string
}
