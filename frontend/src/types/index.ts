export enum BlogVisibility {
  Public = 0,
  FriendsOnly = 1,
  Private = 2,
}

export enum FriendRequestStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Cancelled = 3,
}

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags?: string[];
  authorId?: string;
  author: string;
  avatar: string;
  date: string;
  readTime: string;
  likes: number;
  likedBy: string[];
  comments: number;
  featured: boolean;
  quote?: string;
  paragraphs?: string[];
  commentsList: Comment[];
  visibility: BlogVisibility;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  provider?: string;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  postsCount: number;
  friendsCount: number;
  friendStatus?: FriendRequestStatus;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: User;
};

export type AuthSession = AuthResponse;

export type OtpChallenge = {
  email: string;
  expiresAt: string;
  message: string;
  developmentOtp?: string | null;
};

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  date: string;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
