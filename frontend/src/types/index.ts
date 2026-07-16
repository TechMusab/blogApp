export type Post = {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags?: string[]
  authorId?: string
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
  token: string | null
  isAuthenticated: boolean
}

export type AuthResponse = {
  token: string
  expiresAt: string
  user: User
}

export type AuthSession = AuthResponse

export type OtpChallenge = {
  email: string
  expiresAt: string
  message: string
  developmentOtp?: string | null
}

export type Comment = {
  id: string
  author: string
  avatar: string
  text: string
  date: string
}
