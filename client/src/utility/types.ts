export interface UserInitialStateType {
  user: User | null
  loader: boolean
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  success: boolean
  message: string
  user: User
}

export interface LoginData {
  userAddress: string
  password: string
}

export interface SignupData {
  name: string
  username: string
  email: string
  password: string
}

export interface FetchedPosts {
  success: boolean
  posts: Post[]
}

export interface Post {
  id: string
  createdAt: Date
  updatedAt: Date
  title: string
  content: string
  upvoteIds: string[]
  downvoteIds: string[]
  authorId: string
  comments?: Comment[]
  author?: User
}

export interface PostResponse {
  success: boolean
  post: Post
}

export interface CreatePostReqBody {
  title: string
  content: string
}

export interface FetchedPost {
  success: boolean
  post: Post
}

export interface Comment {
  id: string
  createdAt: Date
  updatedAt: Date
  content: string
  upvoteIds: string[]
  downvoteIds: string[]
  authorId: string
  author?: User
  postId: string
}

export interface CommentVotePayload {
  commentId: string
  postId: string
}

export interface CommentResponse {
  success: boolean
  comment: Comment
}

export interface CommentsResponse {
  success: boolean
  comments: Comment[]
}

export interface CreateCommentPayload {
  content: string
  postId: string
}

export interface AxiosError {
  response: {
    data: {
      message: string
    }
  }
}
