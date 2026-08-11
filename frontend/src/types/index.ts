export type BlogVisibility = 0 | 1 | 2;

export const BlogVisibilityValues = {
  Public: 0,
  FriendsOnly: 1,
  Private: 2,
};

export type FriendRequestStatus = 0 | 1 | 2 | 3;

export const FriendRequestStatusValues = {
  Pending: 0,
  Accepted: 1,
  Rejected: 2,
  Cancelled: 3,
};

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
  authorFriendStatus?: FriendRequestStatus;
  authorFriendRequestDirection?: 'sent' | 'received';
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
  friendRequestDirection?: 'sent' | 'received';
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
  userId?: string;
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

export type NotificationType = 'FriendRequest' | 'FriendRequestAccepted' | 'Comment' | 'Like' | 'PostSaved';

export type Notification = {
  id: number;
  recipientUserId: number;
  actorUserId: number;
  type: NotificationType;
  message: string;
  postId?: number | null;
  commentId?: number | null;
  isRead: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatar?: string;
  postTitle?: string | null;
};

export type ConversationDto = {
  conversationId: number;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadMessageCount: number;
};

export type MessageDto = {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  readAt?: string;
};
